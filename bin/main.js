#!/usr/bin/env node

// @ts-check
import fs from "node:fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { request } from "undici";
import { ValiError, parse, string, url } from "valibot";
import { multiselect, question, select } from "@topcli/prompts";

(async function main() {
	const argv = yargs(hideBin(process.argv))
		.scriptName("swagrec")
		.usage("$0 [OPTIONS...]")
		.option("url", {
			alias: "u",
			type: "string",
			description: "link to your /swagger.json definition",
		})
		.option("output", {
			alias: "o",
			type: "string",
			description: "path to file output relative to this directory",
			requiresArg: false,
		})
		.strict()
		.parse();

	/** ### validate url argument */
	if ("url" in argv && argv.url) {
		try {
			const urlArg = parse(string([url()]), argv.url);

			const res = await request(urlArg);
			const body = await validateResponseFormat(res);

			/** ### START THE PROMPT */
			/** @type {string[]} */
			const optionPaths = [];
			for (const [key, value] of Object.entries(body.paths)) {
				/**  ### handle if an endpoint have more than one method */
				if (value.get) optionPaths.push(`[GET]  ${key}`);
				if (value.post) optionPaths.push(`[POST]  ${key}`);
				if (value.put) optionPaths.push(`[PUT]  ${key}`);
				if (value.patch) optionPaths.push(`[PATCH]  ${key}`);
				if (value.delete) optionPaths.push(`[DELETE]  ${key}`);
			}

			/** ### sort paths option based on it's methods */
			const sortPriority = ["GET", "POST", "PUT", "PATCH", "DELETE"];
			optionPaths.sort(
				(a, b) =>
					sortPriority.indexOf(a.split("]")[0].slice(1)) -
					sortPriority.indexOf(b.split("]")[0].slice(1))
			);

			/** ### ask user where to output the file */
			let output_location = await question("Enter output file location: ");

			if (!output_location) {
				exitWithError("Invalid path. Enter valid path");
			}

			if (output_location[0] !== "." || output_location[1] !== "/") {
				output_location = `./${output_location}`;
			}

			if (!output_location.includes(".json")) {
				output_location = `${output_location}.json`;
			}

			/** read file if exist, create new if not */
			const existing = await readOrCreateOutputFile(output_location);

			/** ### ask user to select enpoint they will use */
			const selectedPathsDetail = getSelectedPathsPrompt(body, optionPaths);

			/** ### parse selected endpoint to get related schema using $ref as reference */
			const schemasDetails = getSelectedPathRef(
				body,
				JSON.stringify(selectedPathsDetail)
			);

			/** find nested $ref and repeat the same process as above */
			const nestedSchemasDetails = getSelectedPathRef(
				body,
				JSON.stringify(schemasDetails)
			);

			console.log("\n");
			console.log("Writing to the file...");

			// TODO: handle case when file already exist
			if (existing) {
			} else {
				await fs.writeFile(
					output_location,
					JSON.stringify({
						...body,
						paths: selectedPathsDetail,
						components: {
							...body.components,
							schemas: { ...schemasDetails, ...nestedSchemasDetails },
						},
					})
				);
			}

			console.log("Completed!");
		} catch (err) {
			if (err instanceof ValiError) exitWithError(err.message);
			if ("code" in err && err.code === "ENOENT") exitWithError(err.message);
			else {
				console.error(err);
				exitWithError(err);
			}
		}
	} else {
		exitWithError("Invalid URL. Try '--help' to learn more.");
	}
})();

/**
 * function to exit the program with optional error message
 * @param {string} err
 * @param {number} [exitCode]
 * @returns void
 */
export function exitWithError(err, exitCode) {
	if (err) console.error(err);
	process.exit(exitCode);
}

/**
 * Validate fetch response from URL provided
 * @param {import('undici').Dispatcher.ResponseData} res
 * @returns {Promise<import('openapi3-ts').oas30.OpenAPIObject>}
 */
export async function validateResponseFormat(res) {
	/** exit when request failed */
	if (res.statusCode < 200 || res.statusCode > 300) {
		exitWithError(
			`Invalid Request: Something went wrong, error ${res.statusCode}.`
		);
	}

	/** check http header to make sure it's json file */
	if (
		"content-type" in res.headers &&
		!res.headers["content-type"]?.includes("application/json")
	) {
		exitWithError("Invalid Format: URL is't returning valid JSON file.");
	}

	/**
	 * parse content to make sure it's valid openAPI definition
	 * by checking if required fields exist
	 * references: https://swagger.io/specification/
	 */

	const body = /** @type {object} */ (await res.body.json());
	if (!body.openapi || !body.info || !body.info.title || !body.info.version) {
		exitWithError(
			"Invalid Format: Use valid OpenAPI definition. Go to https://swagger.io/specification/ for reference. "
		);
	}

	return body;
}

/**
 *
 * @param {import("openapi3-ts/oas30").OpenAPIObject} body
 * @param {string[]} options
 */
async function getSelectedPathsPrompt(body, options) {
	/** ### ask user to select enpoint they will use */
	const selectedPaths = await multiselect("Select endpoint you want to use", {
		choices: options,
		preSelectedChoices: [],
	});

	/** ### filter object with selected path & method */
	/** @type {import("openapi3-ts").oas30.PathObject} */
	const selectedPathsDetail = {};
	for (const item of selectedPaths) {
		const [m, path] = item.split("  ");
		const method = m.split("]")[0].slice(1).toLowerCase();

		if (path in body.paths && method in body.paths[path]) {
			selectedPathsDetail[path] = {};
			selectedPathsDetail[path][method] = body.paths[path][method];
		}
	}

	return selectedPathsDetail;
}

/**
 *
 * @param {import("openapi3-ts/oas30").OpenAPIObject} body
 * @param {string} stringify
 */
function getSelectedPathRef(body, stringify) {
	const refs = stringify.split(`"$ref"`);

	const schemas = new Set([]);
	for (let i = 0; i < refs.length; i++) {
		if (i === 0) continue;
		let ref = refs[i].split("}")[0];
		ref = ref.slice(2, ref.length - 1);

		schemas.add(ref);
	}

	/** ### extract complete top-level schema value  */
	/** @type {object} */
	const schemasDetails = {};
	for (const sc of schemas) {
		const schemaName = sc.split("/").slice(1);
		schemasDetails[schemaName[2]] =
			body[schemaName[0]][schemaName[1]][schemaName[2]];
	}

	return schemasDetails;
}

/**
 * Check if provided file path exist, if not create new file.
 * @param {string} path
 */
export async function readOrCreateOutputFile(path) {
	try {
		const r = await fs.readFile(path, "utf-8");
		// TODO: handle if files exist
		return r;
	} catch (err) {
		if ("code" in err && err.code === "ENOENT" && "message" in err) {
			console.log("File not found, creating a new file...");

			try {
				const pathArr = path.split("/");
				console.log({
					pathArr,
					dir: pathArr.slice(0, pathArr.length - 1).join("/"),
					fil: pathArr[pathArr.length - 1],
				});

				await fs.mkdir(pathArr.slice(0, pathArr.length - 1).join("/"), {
					recursive: true,
				});

				await fs.writeFile(path, "");
				console.log("File created successfully.");
			} catch (err) {
				exitWithError(`Error creating file: ${err}`);
			}
		} else exitWithError(`Error reading file: ${err}`);
	}
}
