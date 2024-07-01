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

export const defKeys = {
	components: "components" as const,
	definitions: "definitions" as const,
	getDefinitionKey: function (parent: object) {
		if (!!parent && typeof parent === "object") {
			if (this.components in parent) return this.components;
			if (this.definitions in parent) return this.definitions;
		}
	},
	getDefinitionVal: function (parent: object) {
		if (!!parent && typeof parent === "object") {
			if (this.components in parent) {
				return parent[this.components] as Record<string, unknown>;
			}
			if (this.definitions in parent) {
				return parent[this.definitions] as Record<string, unknown>;
			}
		}

		return null;
	},
};
