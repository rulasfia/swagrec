// @ts-check

import { exitWithError } from "./exit-with-error.js";

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
