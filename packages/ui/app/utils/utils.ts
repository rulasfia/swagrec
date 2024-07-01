import { defKeys } from "@swagger/core";

export type EndpointItem = { method: string; path: string };

export function getEndpointList(reference: Record<string, string>) {
	const endpointList: EndpointItem[] = [];

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
		if (key === defKeys.components) {
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

		if (key === defKeys.definitions) {
			if (typeof value === "object") {
				essentialProps[key] = {};
			}
			continue;
		}

		essentialProps[key] = value;
	}

	return essentialProps;
}

export function getSelectedPath(reference: object, selected: EndpointItem[]) {
	if (!("paths" in reference)) return {};
	if (!reference.paths) return {};
	if (typeof reference.paths !== "object") return {};

	const result: Record<string, unknown> = {};
	for (const { method, path } of selected) {
		result[path] = {
			[method]: reference.paths[path as keyof typeof reference.paths][method],
		};
	}

	return result;
}

export function getUniqueRefs(reference: object, paths: object) {
	const components = defKeys.getDefinitionVal(reference);
	if (!components) {
		return {};
	}

	let refs: Record<string, unknown> = {};

	const pathsString = JSON.stringify(paths);

	let length = 0;
	let y = pathsString;
	do {
		const x = getRefsFromString(components, y);
		y = JSON.stringify(x);

		length = Object.keys(x).length;
		refs = { ...refs, ...x };
	} while (length > 0);

	return refs;
}

function getRefsFromString(referenceComponents: object, inputString: string) {
	const refs: Record<string, unknown> = {};

	const refsItem = getUniqueRefsItem(inputString);

	const components = referenceComponents;
	refsItem.forEach((item) => {
		const keys = item.split("/");

		if (keys.includes(defKeys.components)) {
			// ["#", "components", "schemas", "Pet"];
			refs[keys[3]] = components[keys[2] as keyof typeof components][keys[3]];
		} else {
			// ["#", "definitions", "Pet"];
			refs[keys[2]] = components[keys[2] as keyof typeof components];
		}
	});

	return refs;
}

function getUniqueRefsItem(inputString: string) {
	// detect $ref in the selected paths
	const a = inputString.split('"$ref":"');
	// get the location of the $ref in the $components
	const b = a.map((item) => item.split(`"}`)[0]);
	b.shift();
	// remove $ref duplicates with Set
	const c = new Set(b);

	return c;
}
