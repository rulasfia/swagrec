import { useSearchParams } from "@solidjs/router";
import { Button } from "~/components/button";
import { Input } from "~/components/input";
import { urlAction } from "~/utils/utils";

const modeOptions = [
	{ label: "From URL", mode: "url" },
	{ label: "From JSON", mode: "json" },
];

export default function Home() {
	const [searchParams, setSearchParams] = useSearchParams();

	if (!searchParams.mode) setSearchParams({ mode: "url" });

	return (
		<main class="text-center pt-16 container mx-auto">
			<p>Select reference mode:</p>
			<div
				id="mode_selector"
				class="flex flex-row gap-x-4 mt-4 justify-center items-center"
			>
				{modeOptions.map(({ label, mode }) => (
					<button
						type="button"
						onclick={() => setSearchParams({ mode })}
						class={`w-28 text-center py-2 text-sm shadow-sm hover:shadow-md hover:text-neutral-900 rounded-full transition duration-100 ease-in font-medium hover:ring-2 hover:ring-orange-400 ${searchParams.mode === mode ? "bg-orange-100 text-orange-600 hover:text-orange-700" : "bg-white hover:bg-neutral-200 text-neutral-700 hover:text-neutral-900"}`}
					>
						{label}
					</button>
				))}
			</div>

			{searchParams.mode === "url" && (
				<form class="mt-8 mx-auto max-w-[480px]" action="/from-url">
					<div class="flex flex-col gap-y-2 w-full items-start">
						<label for="reference_url" class="text-sm font-medium">
							Reference URL
						</label>
						<Input
							type="url"
							name="reference_url"
							id="reference_url"
							required
							placeholder="https://example.com/v2/swagger.json"
						/>
						<div class="flex flex-row justify-end w-full">
							<Button type="submit" class="w-24">
								Submit
							</Button>
						</div>
					</div>
				</form>
			)}

			{searchParams.mode === "json" && (
				<form class="mt-8 mx-auto max-w-[480px]">
					<div class="flex flex-col gap-y-2 w-full items-start">
						<label for="reference_content" class="text-sm font-medium">
							Reference Content
						</label>
						<textarea
							name="reference_content"
							id="reference_content"
							placeholder="Paste your Swagger JSON here"
							rows={8}
							class="w-full px-4 py-2 text-sm border font-mono border-neutral-600 bg-neutral-900 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition duration-100 ease-in"
						/>
						<div class="flex flex-row justify-end w-full">
							<Button type="submit" class="w-24">
								Submit
							</Button>
						</div>
					</div>
				</form>
			)}
		</main>
	);
}
