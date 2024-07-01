import { Button } from "../components/button";
import { Input } from "../components/input";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import {
	EndpointItem,
	getEssentialProps,
	getSelectedPath,
	getUniqueRefs,
} from "../utils/utils";
import type { MetaFunction } from "@remix-run/cloudflare";
import { defKeys, getEndpointList } from "@swagger/core";

export const meta: MetaFunction = () => {
	return [
		{ title: "Swagreg - From JSON" },
		{
			name: "description",
			content: "Welcome to Swagreg!",
		},
	];
};

export default function FromJSONPage() {
	const [referenceContent, setReferenceContent] = useState<
		undefined | Record<string, unknown>
	>();
	const [outputContent, setOutputContent] = useState<
		undefined | Record<string, unknown>
	>();

	const [endpoints, setEndpoints] = useState<EndpointItem[]>([]);
	const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointItem[]>([]);

	const [coppied, setCoppied] = useState(false);

	useEffect(() => {
		if (typeof sessionStorage !== "undefined") {
			const parsed = JSON.parse(
				sessionStorage.getItem("referenceContent") ?? "{}",
			);
			const reference = JSON.parse(parsed);
			const options = getEndpointList(reference as Record<string, string>);

			setReferenceContent(reference);
			setEndpoints(options);
		}
	}, []);

	/** function to handle the checkbox selection of endpoints */
	function selectEndpointHandler(
		e: ChangeEvent<HTMLInputElement>,
		endpoint: EndpointItem,
	) {
		if (e.target.checked) setSelectedEndpoint((cv) => [...cv, endpoint]);
		else setSelectedEndpoint((cv) => cv.filter((e) => e !== endpoint));
	}

	function copyToClipboardHandler() {
		navigator.clipboard.writeText(JSON.stringify(outputContent, null, 2) ?? "");
		setCoppied(true);
		setTimeout(() => setCoppied(false), 2000);
	}

	const generateOutputHandler = useCallback(() => {
		if (!referenceContent) return;

		console.log({ referenceContent });
		const output = getEssentialProps(referenceContent);
		console.log({ output });
		const paths = getSelectedPath(referenceContent, selectedEndpoint);

		output.paths = paths;

		const refs = getUniqueRefs(referenceContent, paths);

		const val = defKeys.getDefinitionKey(output);
		if (!val) return;

		if (defKeys.getDefinitionKey === "components") {
			output[val].schemas = refs;
		} else {
			output[val] = refs;
		}

		setOutputContent(output);
	}, [referenceContent, selectedEndpoint]);

	return (
		<main className="container mx-auto py-8 grid grid-cols-2 w-full gap-8">
			<section className="flex h-full flex-col gap-y-2 w-full items-start">
				<div className="flex flex-col gap-y-2 w-full items-start">
					<label htmlFor="reference_url" className="text-sm font-medium">
						Reference URL
					</label>
					<div className="flex flex-row gap-x-2 w-full items-center">
						<Input
							type="url"
							name="reference_url"
							id="reference_url"
							disabled
							placeholder="https://example.com/v2/swagger.json"
						/>
						<Button>Submit</Button>
					</div>
				</div>
				<div className="w-full">
					<h5 className="text-lg font-semibold mt-4">Select Endpoint</h5>
					<div className="flex rounded-md h-80 flex-col gap-y-2 w-full p-4 bg-neutral-900 items-start mt-2 overflow-y-auto">
						{/* endpoint selector as checkbox */}
						{endpoints.map((endpoint) => {
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
										onChange={(e) => selectEndpointHandler(e, endpoint)}
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
					{/* <Textarea
						name="reference_content"
						id="reference_content"
						className="w-full font-mono text-nowrap overflow-x-auto"
						rows={17}
						disabled
						defaultValue={JSON.stringify(referenceContent, null, 2)}
					/> */}
					<code className="w-full font-mono text-nowrap overflow-x-auto h-[360px] rounded-md bg-neutral-900 text-sm">
						<pre>{JSON.stringify(referenceContent, null, 2)}</pre>
					</code>
				</div>
			</section>
			<section className="flex h-full flex-col gap-y-2 w-full items-start">
				<h5 className="text-lg font-semibold mt-4">Selected Endpoint</h5>
				<ul className="list-disc list-inside flex rounded-md h-80 flex-col gap-y-2 w-full p-4 bg-neutral-900 items-start mt-2 overflow-y-auto">
					{selectedEndpoint.map((endpoint) => (
						<li key={JSON.stringify(endpoint)} className="font-mono">
							{`[${endpoint.method.toUpperCase()}] ${endpoint.path}`}
						</li>
					))}
				</ul>
				<Button
					disabled={selectedEndpoint.length === 0}
					onClick={generateOutputHandler}
				>
					Generate Output
				</Button>
				<div className="w-full h-max mt-9 flex flex-col gap-y-2 items-start">
					<div className="flex items-center justify-between w-full flex-row gap-4">
						<label htmlFor="reference_content" className="text-sm font-medium">
							Output Content
						</label>
						<button
							onClick={copyToClipboardHandler}
							disabled={coppied || !outputContent}
							className="text-orange-500 disabled:text-orange-300 text-sm disabled:cursor-not-allowed disabled:no-underline hover:underline"
						>
							{coppied ? "Copied!" : "Copy to Clipboard"}
						</button>
					</div>
					{/* <Textarea
						name="reference_content"
						id="reference_content"
						className="w-full h-full font-mono text-nowrap overflow-x-auto"
						rows={17}
						disabled
						defaultValue={JSON.stringify(outputContent, null, 2)}
					/> */}
					<code className="w-full font-mono text-nowrap overflow-x-auto h-[360px] rounded-md bg-neutral-900 text-sm">
						<pre>{JSON.stringify(outputContent, null, 2)}</pre>
					</code>
				</div>
			</section>
		</main>
	);
}
