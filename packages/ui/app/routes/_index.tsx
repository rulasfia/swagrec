import type { MetaFunction } from "@remix-run/cloudflare";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { Button } from "../components/button";
import { Input } from "../components/input";

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
	{ label: "From URL", mode: "url" },
	{ label: "From JSON", mode: "json" },
];

export default function Index() {
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
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
						onClick={() => setSearchParams({ mode })}
						className={`w-28 text-center py-2 text-sm shadow-sm hover:shadow-md hover:text-neutral-900 rounded-full transition duration-100 ease-in font-medium hover:ring-2 hover:ring-orange-400 ${searchParams.get("mode") === mode ? "bg-orange-100 text-orange-600 hover:text-orange-700" : "bg-white hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900"}`}
					>
						{label}
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
					className="mt-8 mx-auto max-w-[480px]"
					onSubmit={(e) => {
						e.preventDefault();

						const form = new FormData(e.currentTarget);
						const refContent = JSON.stringify(form.get("reference_content"));
						sessionStorage.setItem("referenceContent", refContent);
						navigate("/from-json");
					}}
				>
					<div className="flex flex-col gap-y-2 w-full items-start">
						<label htmlFor="reference_content" className="text-sm font-medium">
							Reference Content
						</label>
						<textarea
							name="reference_content"
							id="reference_content"
							placeholder="Paste your Swagger JSON here"
							rows={8}
							className="w-full px-4 py-2 text-sm border font-mono border-neutral-600 bg-neutral-900 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition duration-100 ease-in"
						/>
						<div className="flex flex-row justify-end w-full">
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
