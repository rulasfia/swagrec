/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Parses Swagger/OpenAPI JSON string and extracts paths and schemas
 * @param swaggerJson - Stringified Swagger/OpenAPI JSON
 * @returns Object containing sorted paths and schemas
 */
export function parseSwaggerJson(swaggerJson: string): {
	paths: Record<string, any>;
	schemas: Record<string, any>;
} {
	try {
		const parsed = JSON.parse(swaggerJson);
		const result: { paths: Record<string, any>; schemas: Record<string, any> } = {
			paths: {},
			schemas: {}
		};

		// Extract and sort paths by method
		if (parsed.paths) {
			const allPaths: any[] = [];

			Object.keys(parsed.paths).forEach((path) => {
				Object.keys(parsed.paths[path]).forEach((method) => {
					allPaths.push({
						path,
						method: method.toUpperCase(),
						operation: parsed.paths[path][method]
					});
				});
			});

			// Sort paths by method
			const methodOrder = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];
			allPaths.sort((a, b) => {
				const methodIndexA = methodOrder.indexOf(a.method);
				const methodIndexB = methodOrder.indexOf(b.method);
				return methodIndexA - methodIndexB;
			});

			result.paths = allPaths.reduce((acc: Record<string, any>, pathObj: any) => {
				const key = `${pathObj.method} ${pathObj.path}`;
				acc[key] = pathObj.operation;
				return acc;
			}, {});
		}

		// Extract schemas
		if (parsed.components?.schemas) {
			result.schemas = parsed.components.schemas;
		} else if (parsed.definitions) {
			result.schemas = parsed.definitions;
		}

		return result;
	} catch (error) {
		throw new Error(`Failed to parse Swagger JSON: ${error}`);
	}
}

/**
 * Extracts schemas used in selected paths including referenced schemas
 * @param parsedData - Return value from parseSwaggerJson function
 * @param selectedPaths - Array of selected path strings (e.g., ['GET /users', 'POST /users'])
 * @returns Object containing all schemas used in selected paths
 */
export function extractSchemasFromPaths(
	parsedData: { paths: Record<string, any>; schemas: Record<string, any> },
	selectedPaths: string[]
): Record<string, any> {
	const { paths, schemas } = parsedData;
	const selectedSchemas: Record<string, any> = {};
	const referencedSchemas = new Set<string>();

	// Helper function to extract schema references from an object
	function extractSchemaRefs(obj: any): void {
		if (!obj) return;

		if (typeof obj === 'object') {
			// Check for direct schema reference
			if (obj.$ref) {
				const ref = obj.$ref;
				const schemaName = ref.split('/').pop();
				referencedSchemas.add(schemaName);
			}

			// Recursively check all properties
			Object.values(obj).forEach((value) => {
				if (typeof value === 'object') {
					extractSchemaRefs(value);
				}
			});
		}
	}

	// Process each selected path
	selectedPaths.forEach((pathKey) => {
		const pathData = paths[pathKey];
		if (pathData) {
			// Check parameters
			if (pathData.parameters) {
				pathData.parameters.forEach((param: any) => {
					if (param.schema) {
						extractSchemaRefs(param.schema);
					}
				});
			}

			// Check request body
			if (pathData.requestBody) {
				extractSchemaRefs(pathData.requestBody);
			}

			// Check responses
			if (pathData.responses) {
				Object.values(pathData.responses).forEach((response: any) => {
					if (response.content) {
						Object.values(response.content).forEach((content: any) => {
							if (content.schema) {
								extractSchemaRefs(content.schema);
							}
						});
					} else if (response.schema) {
						extractSchemaRefs(response.schema);
					}
				});
			}
		}
	});

	// Add all referenced schemas recursively
	const processSchemaRefs = (schemaNames: Set<string>): void => {
		const newRefs = new Set<string>();

		schemaNames.forEach((schemaName) => {
			if (schemas[schemaName] && !selectedSchemas[schemaName]) {
				selectedSchemas[schemaName] = schemas[schemaName];
				extractSchemaRefs(schemas[schemaName]);

				// Check for new references found in this schema
				referencedSchemas.forEach((ref) => {
					if (!selectedSchemas[ref]) {
						newRefs.add(ref);
					}
				});
			}
		});

		// Process any newly found references
		if (newRefs.size > 0) {
			processSchemaRefs(newRefs);
		}
	};

	processSchemaRefs(referencedSchemas);

	return selectedSchemas;
}

/**
 * Filters Swagger/OpenAPI JSON to include only selected paths and their schemas
 * @param swaggerJson - Stringified Swagger/OpenAPI JSON
 * @param selectedPaths - Array of selected path strings (e.g., ['GET /users', 'POST /users'])
 * @returns Stringified Swagger/OpenAPI JSON with only selected paths and schemas
 */
export function filterSwaggerJson(swaggerJson: string, selectedPaths: string[]): string {
	const parsed = JSON.parse(swaggerJson);
	const parsedData = parseSwaggerJson(swaggerJson);
	const selectedSchemas = extractSchemasFromPaths(parsedData, selectedPaths);

	// Create a new object with only selected paths
	const filteredPaths: Record<string, any> = {};

	// Convert our path format back to the original format
	selectedPaths.forEach((pathKey) => {
		const pathData = parsedData.paths[pathKey];
		if (pathData) {
			// Extract method and path from our format "METHOD /path"
			const [method, ...pathParts] = pathKey.split(' ');
			const path = pathParts.join(' ');

			if (!filteredPaths[path]) {
				filteredPaths[path] = {};
			}

			// Convert method back to lowercase for OpenAPI format
			filteredPaths[path][method.toLowerCase()] = pathData;
		}
	});

	// Create filtered document
	const filteredDoc: any = {
		...parsed,
		paths: filteredPaths
	};

	// Add filtered schemas
	if (parsed.components) {
		filteredDoc.components = {
			...parsed.components,
			schemas: selectedSchemas
		};
	} else if (parsed.definitions) {
		filteredDoc.definitions = selectedSchemas;
	}

	return JSON.stringify(filteredDoc, null, 2);
}
