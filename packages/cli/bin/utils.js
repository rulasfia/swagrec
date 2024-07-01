import { parse, string, url } from "valibot";

/**
 * Parse data from a remote URL to JS Object.
 *
 * @param {string} input_url - the URL to parse data from
 * @param {(v:string) => Promise} requestFn - Funtion to make request
 */
export function parse_from_remote_url(input_url, requestFn) {
	const url_arg = parse(string([url()]), input_url);

	return requestFn(url_arg);
}
