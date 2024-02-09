// @ts-check
import fs from "node:fs/promises";
import fsSync from "node:fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { request } from "undici";
import { ValiError, parse, string, url } from "valibot";
import { multiselect, select } from "@topcli/prompts";
import { validateResponseFormat } from "./validate-response-format.js";
import { exitWithError } from "./exit-with-error.js";
import { readOrCreateOutputFile } from "./read-or-create-output.js";

const TARGET = "./output/service.json";

(async function main() {
	const argv = yargs(hideBin(process.argv))
		.scriptName("swagrec")
		.usage("$0 [OPTIONS...]")
		.option("url", {
			alias: "u",
			type: "string",
			description: "link to your /swagger.json definition",
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

			const selectedPaths = await multiselect(
				"Select endpoint you want to use",
				{ choices: optionPaths, preSelectedChoices: [] }
			);

			/** ### filter object with selected path & method */
			/** @type {import("openapi3-ts/").oas30.PathObject} */
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

			/** @type {string[]} */
			const schemas = [];
			for (let i = 0; i < refs.length; i++) {
				if (i === 0) continue;
				let ref = refs[i].split("}")[0];
				ref = ref.slice(2, ref.length - 1);

				schemas.push(ref);
			}

			console.log("top-level schemas: ", schemas);

			console.log("\n");
			console.log("Writing to the file...");

			/** read file if exist, create new if not */
			// const e = await readOrCreateOutputFile(TARGET);

			// console.log("e", e);

			// await fs.writeFile(TARGET, JSON.stringify({ schemas }));
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
