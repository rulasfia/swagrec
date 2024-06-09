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
