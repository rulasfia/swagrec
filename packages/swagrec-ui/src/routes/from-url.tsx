import { useSearchParams } from "@solidjs/router";
import { Button } from "~/components/button";
import { Input } from "~/components/input";

export default function FromURLPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	return (
		<main class="grid py-8 grid-cols-2 container mx-auto gap-12">
			<section>
				{/* reference url */}
				<div class="flex flex-col gap-y-2 w-full items-start">
					<label for="reference_url">Reference URL</label>
					<div class="flex w-full flex-row justify-between gap-4 items-center">
						<Input
							type="url"
							name="reference_url"
							id="reference_url"
							required
							placeholder="https://example.com/v2/swagger.json"
							value={searchParams.reference_url ?? ""}
						/>
						<Button type="submit">Submit</Button>
					</div>
				</div>
				{/* enpoint selector */}
				{/* reference content */}
			</section>
			<section class="">
				{/* selected endpoint */}
				{/* result content */}
				{/* copy to clipboard button */}
			</section>
		</main>
	);
}
