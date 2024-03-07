#!/usr/bin/env node
// @ts-check

import fs from "node:fs/promises";
import process from "node:process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ValiError, parse, string, url } from "valibot";
import { multiselect, question } from "@topcli/prompts";

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

	try {
		const reference = await parse_provided_swagger_reference(argv);
		const output_location = prompt_output_location(
			await question("Enter output file location: "),
		);

		// read file if exist, create new if not
		const existing = await read_or_create_output_file(output_location);

		// handle if output file already exist
		let default_selected = [];
		if (existing) {
			const valid = await validate_response_format(existing);

			// makse sure it's using the same swagger definition as a reference
			if (JSON.stringify(reference.info) !== JSON.stringify(valid.info)) {
				exit_with_error(
					"Invalid Path: Output file already exist from different source reference!",
				);
			}

			default_selected = format_endpoint_as_options(valid);
		}

		const options = format_endpoint_as_options(reference);

		const selected_paths = await prompt_selected_endpoint(
			reference,
			options,
			default_selected,
		);

		// sort selected path (so it's not default_then_newly_added)
		const sorted_selected_paths = Object.keys(selected_paths)
			.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
			.reduce((acc, key) => {
				acc[key] = selected_paths[key];
				return acc;
			}, {});

		const schemas = get_refs_details(
			reference,
			JSON.stringify(sorted_selected_paths),
		);
		const nested_schemas = get_refs_details(reference, JSON.stringify(schemas));

		console.log("\n");
		console.log("Writing to the file...");

		await write_to_output_location({
			reference,
			output_location,
			selected_paths: sorted_selected_paths,
			schemas: { ...schemas, ...nested_schemas },
		});

		if (existing) console.log("Output file updated!");
		console.log("Completed!");
	} catch (err) {
		if (err instanceof ValiError) exit_with_error(err.message);
		if ("code" in err && err.code === "ENOENT") exit_with_error(err.message);
		else {
			console.log("Something when wrong!");
			console.error(err);
			exit_with_error(err);
		}
	}
})();

/**
 * function to exit the program with optional error message
 *
 * @param {string} err
 * @param {number} [exit_code]
 * @returns void
 */
export function exit_with_error(err, exit_code) {
	if (err) console.error(err);
	process.exit(exit_code);
}

/**
 * Parse json data from provided swagger reference location
 *
 * @param {Record<string, unknown> | Promise<Record<string, unknown>>} argv
 */
async function parse_provided_swagger_reference(argv) {
	// check if provided url is local or remote
	if ("url" in argv && argv.url && typeof argv.url === "string") {
		// handle remote path
		if (argv.url.startsWith("https://") || argv.url.startsWith("http://")) {
			try {
				const parsed = await parse_from_remote_url(argv.url);
				const valid = await validate_response_format(parsed);

				return valid;
			} catch (e) {
				exit_with_error(e);
			}
		}

		// TODO: handle local path
		else {
			exit_with_error("This feature is still in development");
		}
	}
}

/**
 * Parse data from a remote URL to JS Object.
 *
 * @param {string} input_url - the URL to parse data from
 */
function parse_from_remote_url(input_url) {
	const url_arg = parse(string([url()]), input_url);

	return fetch(url_arg, { method: "GET" });
}

/**
 * Validate fetch response from URL provided
 *
 * @param {Response | string} res
 * @returns {Promise<import('openapi3-ts').oas30.OpenAPIObject>}
 */
async function validate_response_format(res) {
	/**
	 * validate response body & make sure it's valid openAPI definition
	 * @param {object} body
	 * @returns object
	 */
	function validate_body(body) {
		/**
		 * parse content to make sure it's valid openAPI definition
		 * by checking if required fields exist
		 * references: https://swagger.io/specification/
		 */

		if (
			(!body.openapi && !body.swagger) ||
			!body.info ||
			!body.info.title ||
			!body.info.version
		) {
			console.log(
				(!body.openapi && !body.swagger) ||
					!body.info ||
					!body.info.title ||
					!body.info.version,
			);
			exit_with_error(
				"Invalid Format: Use valid OpenAPI definition. Go to https://swagger.io/specification/ for reference. ",
			);
		}

		return body;
	}

	if (typeof res === "string") {
		return validate_body(JSON.parse(res));
	} else {
		/** exit when request failed */
		if (res.status < 200 || res.status > 300) {
			exit_with_error(
				`Invalid Request: Something went wrong, error ${res.status}.`,
			);
		}
		/** check http header to make sure it's json file */
		if (
			res.headers.has("Content-Type") &&
			!res.headers.get("Content-Type")?.includes("application/json")
		) {
			exit_with_error("Invalid Format: URL is't returning valid JSON file.");
		}

		return validate_body(/** @type {object} */ (await res.json()));
	}
}

/**
 *
 * @param {import("openapi3-ts/oas30").OpenAPIObject} body
 */
function format_endpoint_as_options(body) {
	/** @type {string[]} */
	const option_paths = [];

	if (!body.paths || (body.paths && Object.keys(body.paths).length < 1)) {
		return option_paths;
	}

	for (const [key, value] of Object.entries(body.paths)) {
		/**  handle if an endpoint have more than one method */
		if (value.get) option_paths.push(`[GET]  ${key}`);
		if (value.post) option_paths.push(`[POST]  ${key}`);
		if (value.put) option_paths.push(`[PUT]  ${key}`);
		if (value.patch) option_paths.push(`[PATCH]  ${key}`);
		if (value.delete) option_paths.push(`[DELETE]  ${key}`);
	}

	/** sort paths option based on it's methods */
	const sortPriority = ["GET", "POST", "PUT", "PATCH", "DELETE"];
	option_paths.sort(
		(a, b) =>
			sortPriority.indexOf(a.split("]")[0].slice(1)) -
			sortPriority.indexOf(b.split("]")[0].slice(1)),
	);

	return option_paths;
}

/**
 * function to format output location as a valid path end with json file from string input
 *
 * @param {string} output_location
 * @returns {string}
 */
function prompt_output_location(output_location) {
	if (!output_location) {
		exit_with_error("Invalid path. Enter valid path");
	}

	if (output_location[0] !== "." || output_location[1] !== "/") {
		output_location = `./${output_location}`;
	}

	if (!output_location.includes(".json")) {
		output_location = `${output_location}.json`;
	}

	return output_location;
}

/**
 * Check if provided file path exist, if not create new file.
 *
 * @param {string} path
 * @return {Promise<string>}
 */
export async function read_or_create_output_file(path) {
	try {
		const r = await fs.readFile(path, "utf-8");
		// TODO: handle if files exist
		return r;
	} catch (err) {
		if ("code" in err && err.code === "ENOENT" && "message" in err) {
			console.log("File not found, creating a new file...");

			try {
				const path_arr = path.split("/");
				console.log({
					pathArr: path_arr,
					dir: path_arr.slice(0, path_arr.length - 1).join("/"),
					fil: path_arr[path_arr.length - 1],
				});

				await fs.mkdir(path_arr.slice(0, path_arr.length - 1).join("/"), {
					recursive: true,
				});

				await fs.writeFile(path, "");
				console.log("File created successfully.");
			} catch (err) {
				exit_with_error(`Error creating file: ${err}`);
			}
		} else exit_with_error(`Error reading file: ${err}`);
	}
}

/**
 *
 * @param {import("openapi3-ts/oas30").OpenAPIObject} body
 * @param {string[]} options
 * @param {string[]} pre_selected
 */
async function prompt_selected_endpoint(body, options, pre_selected = []) {
	/** ask user to select enpoint they will use */
	const selected_paths = await multiselect("Select endpoint you want to use", {
		choices: options,
		preSelectedChoices: pre_selected,
	});

	/** filter object with selected path & method */
	/** @type {import("openapi3-ts").oas30.PathObject} */
	const selected_paths_detail = {};
	for (const item of selected_paths) {
		const [m, path] = item.split("  ");
		const method = m.split("]")[0].slice(1).toLowerCase();

		if (path in body.paths && method in body.paths[path]) {
			// check if the path already have data (in case of multiple method)
			selected_paths_detail[path] = selected_paths_detail[path]
				? { ...selected_paths_detail[path] }
				: {};
			selected_paths_detail[path][method] = body.paths[path][method];
		}
	}

	return selected_paths_detail;
}

/**
 *
 * @param {import("openapi3-ts/oas30").OpenAPIObject} body
 * @param {string} stringify
 * @return {object}
 */
function get_refs_details(body, stringify) {
	const refs = stringify.split(`"$ref"`);

	const schemas = new Set([]);
	for (let i = 0; i < refs.length; i++) {
		if (i === 0) continue;
		let ref = refs[i].split("}")[0];
		ref = ref.slice(2, ref.length - 1);

		schemas.add(ref);
	}

	/** extract complete top-level schema value  */
	/** @type {object} */
	const schemas_details = {};
	for (const sc of schemas) {
		const schema_name = sc.split("/").slice(1);
		schemas_details[schema_name[2]] =
			body[schema_name[0]][schema_name[1]][schema_name[2]];
	}

	return schemas_details;
}

/**
 *
 * @param {object} params
 * @param {import("openapi3-ts/oas30").OpenAPIObject} params.reference
 * @param {string} params.output_location
 * @param {import("openapi3-ts/oas30").PathsObject} params.selected_paths
 * @param {import("openapi3-ts/oas30").SchemaObject} params.schemas
 */
async function write_to_output_location({
	reference,
	output_location,
	selected_paths,
	schemas,
}) {
	await fs.writeFile(
		output_location,
		JSON.stringify({
			...reference,
			paths: selected_paths,
			components: { ...reference.components, schemas },
		}),
	);
}

// only export function that need to be tested
export {
	parse_from_remote_url,
	validate_response_format,
	format_endpoint_as_options,
	get_refs_details,
};
