import type { MetaFunction } from "@remix-run/cloudflare";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { useEffect, useRef, useState } from "react";
import { exampleContentJSON } from "../utils/example-json";

export const meta: MetaFunction = () => {
	return [
		{ title: "Swagreg" },
		{
			name: "description",
			content: "Welcome to Swagreg!",
		},
	];
};

const modeOptions = [
	{ label: "From JSON", mode: "json" },
	{ label: "From YAML", mode: "yaml" },
	{ label: "From URL", mode: "url" },
];

export default function Index() {
	const jsonRef = useRef<HTMLTextAreaElement>(null);
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const [errorMessage, setErrorMessage] = useState("");

	// auto redirect to json mode for now
	useEffect(() => {
		if (!searchParams.get("mode")) navigate("?mode=json");
	}, [searchParams, navigate]);

	console.log(searchParams.get("mode"));
	return (
		<main className="text-center pt-16 container mx-auto">
			<p>Select reference mode:</p>
			<div
				id="mode_selector"
				className="flex flex-row gap-x-4 mt-4 justify-center items-center"
			>
				{modeOptions.map(({ label, mode }) => (
					<button
						key={mode}
						type="button"
						disabled={mode !== "json"}
						onClick={() => setSearchParams({ mode })}
						className={`w-fit px-4 text-center py-2 text-sm shadow-sm hover:shadow-md hover:text-neutral-900 rounded-full transition duration-100 ease-in font-medium hover:ring-2 hover:ring-orange-400 disabled:ring-transparent disabled:text-neutral-600 disabled:bg-neutral-200 disabled:cursor-not-allowed ${searchParams.get("mode") === mode ? "bg-orange-100 text-orange-600 hover:text-orange-700" : "bg-white hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900"}`}
					>
						{label + (mode !== "json" ? " (Coming soon)" : "")}
					</button>
				))}
			</div>

			{searchParams.get("mode") === "url" && (
				<form className="mt-8 mx-auto max-w-[480px]" action="/from-url">
					<div className="flex flex-col gap-y-2 w-full items-start">
						<label htmlFor="reference_url" className="text-sm font-medium">
							Reference URL
						</label>
						<Input
							type="url"
							name="reference_url"
							id="reference_url"
							required
							placeholder="https://example.com/v2/swagger.json"
						/>
						<div className="flex flex-row justify-end w-full">
							<Button disabled type="submit" className="w-24">
								Submit (coming soon)
							</Button>
						</div>
					</div>
				</form>
			)}

			{searchParams.get("mode") === "json" && (
				<form
					className="mt-8 mx-auto max-w-[640px]"
					onSubmit={(e) => {
						e.preventDefault();
						setErrorMessage("");

						const form = new FormData(e.currentTarget);
						if (!form.get("reference_content")) {
							setErrorMessage("Reference content is required!");
							return;
						}

						const refContent = JSON.stringify(form.get("reference_content"));

						sessionStorage.setItem("referenceContent", refContent);
						console.log("navigate to /from-json");
						navigate("/from-json");
					}}
				>
					<div className="flex flex-col  gap-y-2 w-full items-start">
						<div className="flex flex-row gap-x-2 w-full items-center justify-between">
							<label
								htmlFor="reference_content"
								className="text-sm font-medium"
							>
								Reference Content (JSON)
							</label>
							<button
								type="button"
								className="text-orange-400"
								onClick={() => {
									if (jsonRef.current) {
										jsonRef.current.value = exampleContentJSON;
									}
								}}
							>
								Add Example Content
							</button>
						</div>
						<textarea
							ref={jsonRef}
							name="reference_content"
							id="reference_content"
							placeholder="Paste your Swagger JSON here"
							rows={18}
							className="w-full px-4 py-2 text-sm border font-mono border-neutral-600 bg-neutral-900 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition duration-100 ease-in"
						/>
						<div className="flex flex-row justify-between w-full">
							{errorMessage !== "" ? (
								<div className="flex flex-col px-4 py-2 gap-y-2 w-fit bg-red-100 rounded-md shadow-sm border border-red-600 border-solid font-medium">
									<p className="text-sm text-red-600">{errorMessage}</p>
								</div>
							) : (
								<span />
							)}

							<Button type="submit" className="w-24">
								Submit
							</Button>
						</div>
					</div>
				</form>
			)}
		</main>
	);
}
