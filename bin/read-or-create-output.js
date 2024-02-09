import { exitWithError } from "./exit-with-error.js";
import fs from "node:fs/promises";

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
