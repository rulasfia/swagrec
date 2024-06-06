import * as v from "valibot";

// request body schema for /api/generate
export const generateBodySchema = v.object({
	endpoints: v.array(
		v.object({
			method: v.string(),
			path: v.string(),
		}),
	),
});

export function getEndpointList(reference: Record<string, string>) {
	const endpointList: { method: string; path: string }[] = [];

	console.log({ reference: reference.paths });
	if (!("paths" in reference)) return endpointList;

	for (const [key, value] of Object.entries(reference.paths)) {
		for (const [method] of Object.entries(value)) {
			endpointList.push({ method, path: key });
		}
	}

	// return sort by method
	return endpointList.sort((a, b) => a.method.localeCompare(b.method));
}

/** get all the props from the reference content except paths and components */
export function getEssentialProps(reference: Record<string, unknown>) {
	const essentialProps: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(reference)) {
		if (key === "paths") {
			essentialProps[key] = {};
			continue;
		}
		if (key === "components") {
			if (typeof value === "object" && "schemas" in value!) {
				essentialProps[key] = {
					...value,
					schemas: {},
				};
			} else {
				essentialProps[key] = {};
			}

			continue;
		}

		essentialProps[key] = value;
	}

	return essentialProps;
}

/**
 * validate response body & make sure it's valid openAPI definition
 * @param {object} body
 * @returns object
 */
export function validate_body(body: unknown) {
	/**
	 * parse content to make sure it's valid openAPI definition
	 * by checking if required fields exist
	 * references: https://swagger.io/specification/
	 */
	const errorMessage =
		"Invalid Format: Use valid OpenAPI definition. Go to https://swagger.io/specification/ for reference. ";

	const oapiSchema = v.object({
		openapi: v.string(),
		info: v.object({
			title: v.string(),
			description: v.string(),
			version: v.string(),
		}),
	});

	const result = v.safeParse(oapiSchema, body);

	if (!result.success) {
		console.log(result.issues);
		throw new Error(errorMessage);
	}

	return body;
}

/**
 * validate response body & make sure it's valid json
 * @param {object | string} res
 * @returns object
 */
export async function validate_response_format(
	res: Awaited<ReturnType<typeof fetch>> | string,
) {
	if (typeof res === "string") {
		return validate_body(JSON.parse(res));
	}

	/** exit when request failed */
	if (res.status < 200 || res.status > 300) {
		throw new Error(
			`Invalid Request: Something went wrong, error ${res.status}.`,
		);
	}

	/** check http header to make sure it's json file */
	if (!res.headers.get("content-type")?.includes("application/json")) {
		throw new Error("Invalid Format: URL is't returning valid JSON file.");
	}

	return validate_body(await res.json());
}

export function getSelectedPath(
	reference: object,
	selected: v.Output<typeof generateBodySchema>["endpoints"],
) {
	if (!("paths" in reference)) return {};
	if (!reference.paths) return {};
	if (typeof reference.paths !== "object") return {};

	let result: Record<string, unknown> = {};
	for (const { method, path } of selected) {
		result[path] = {
			[method]: reference.paths[path as keyof typeof reference.paths][method],
		};
	}

	return result;
}

export function getUniqueRefs(reference: object, paths: object) {
	if (!("components" in reference)) return {};
	if (!reference.components) return {};
	if (typeof reference.components !== "object") return {};

	let refs: Record<string, any> = {};

	const pathsString = JSON.stringify(paths);

	// get the refs from the reference
	const refsItem = getUniqueRefsItem(pathsString);

	refsItem.forEach((item) => {
		const keys = item.split("/");

		refs[keys[3]] = (reference.components as object)[
			keys[2] as keyof typeof reference.components
		][keys[3]];
	});

	// get nested refs from the refsItem
	const nestedRefsItem = getUniqueRefsItem(JSON.stringify(refs));

	nestedRefsItem.forEach((item) => {
		const keys = item.split("/");

		refs[keys[3]] = (reference.components as object)[
			keys[2] as keyof typeof reference.components
		][keys[3]];
	});

	return refs;
}

function getUniqueRefsItem(pathsString: string) {
	// detect $ref in the selected paths
	const a = pathsString.split('"$ref":"');
	// get the location of the $ref in the $components
	const b = a.map((item) => item.split(`"}`)[0]);
	b.shift();
	// remove $ref duplicates with Set
	const c = new Set(b);

	return c;
}
