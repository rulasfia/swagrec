#!/usr/bin/env node

// @ts-check
import fs from "node:fs/promises";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { request } from "undici";
import { ValiError, parse, string, url } from "valibot";
import { multiselect, question, select } from "@topcli/prompts";
import { validateResponseFormat } from "./validate-response-format.js";
import { exitWithError } from "./exit-with-error.js";
import { readOrCreateOutputFile } from "./read-or-create-output.js";

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

			/** ### ask user to select enpoint they will use */
			const selectedPaths = await multiselect(
				"Select endpoint you want to use",
				{ choices: optionPaths, preSelectedChoices: [] }
			);

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

			/** ### parse selected endpoint to get related schema using $ref as reference */
			const refs = JSON.stringify(selectedPathsDetail).split(`"$ref"`);

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

			/** find nested $ref and repeat the same process as above */
			const nestedRefs = JSON.stringify(schemasDetails).split(`"$ref"`);

			const nestedSchemas = new Set([]);
			for (let i = 0; i < nestedRefs.length; i++) {
				if (i === 0) continue;
				let ref = nestedRefs[i].split("}")[0];
				ref = ref.slice(2, ref.length - 1);

				nestedSchemas.add(ref);
			}

			/** ### extract complete schema value  */
			/** @type {object} */
			const nestedSchemasDetails = {};
			for (const sc of nestedSchemas) {
				const schemaName = sc.split("/").slice(1);
				nestedSchemasDetails[schemaName[2]] =
					body[schemaName[0]][schemaName[1]][schemaName[2]];
			}

			console.log({ schemas, nestedSchemas });

			console.log("\n");
			console.log("Writing to the file...");

			/** read file if exist, create new if not */
			const e = await readOrCreateOutputFile(output_location);

			// TODO: handle case when file already exist
			if (e) {
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
