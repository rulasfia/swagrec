import { Textarea } from "../components/textarea";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { LoaderFunctionArgs, json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

const endpoints = [
	{ method: "GET", path: "/pets" },
	{ method: "GET", path: "/foods" },
	{ method: "GET", path: "/users" },
	{ method: "POST", path: "/users" },
	{ method: "PUT", path: "/users" },
	{ method: "DELETE", path: "/users" },
	{ method: "GET", path: "/users/:id" },
	{ method: "POST", path: "/users/:id" },
	{ method: "PUT", path: "/users/:id" },
	{ method: "DELETE", path: "/users/:id" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const referenceURL = new URL(request.url).searchParams.get("reference_url");
	console.log({ referenceURL });

	console.log("Loader called");
	return json({ endpoints, referenceURL });
};

export default function FromJSONPage() {
	const data = useLoaderData<typeof loader>();

	return (
		<main className="flex container mx-auto py-8 flex-row justify-between w-full gap-8">
			<section className="flex flex-col gap-y-2 w-full items-start">
				<div className="flex flex-col gap-y-2 w-full items-start">
					<label htmlFor="reference_url" className="text-sm font-medium">
						Reference URL
					</label>
					<div className="flex flex-row gap-x-2 w-full items-center">
						<Input
							type="url"
							name="reference_url"
							id="reference_url"
							required
							defaultValue={data.referenceURL ?? ""}
							placeholder="https://example.com/v2/swagger.json"
						/>
						<Button>Submit</Button>
					</div>
				</div>
				<div className="w-full">
					<h5 className="text-lg font-semibold mt-4">Select Endpoint</h5>
					<div className="flex rounded-md max-h-80 flex-col gap-y-2 w-full p-4 bg-neutral-900 items-start mt-2 overflow-y-auto">
						{/* endpoint selector as checkbox */}
						{data.endpoints?.map((endpoint) => {
							const key = `endpoint_${endpoint.method}_${endpoint.path}`;
							return (
								<div
									key={key}
									className="flex flex-row gap-x-2 w-full items-center"
								>
									<input
										type="checkbox"
										id={key}
										name={key}
										value={JSON.stringify(endpoint)}
									/>
									<label htmlFor={key} className="font-mono">
										{`[${endpoint.method.toUpperCase()}] ${endpoint.path}`}
									</label>
								</div>
							);
						})}
					</div>
				</div>
				<div className="w-full mt-4 flex flex-col gap-y-2 items-start">
					<label htmlFor="reference_content" className="text-sm font-medium">
						Reference Content
					</label>
					<Textarea
						name="reference_content"
						id="reference_content"
						className="w-full"
						rows={16}
					/>
				</div>
			</section>
			<section className="flex flex-col gap-y-2 w-full h-full items-start">
				<p>Selected Endpoint</p>
			</section>
		</main>
	);
}
