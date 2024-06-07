import { html } from "hono/html";
import { FC } from "hono/jsx";

export const HomePage: FC = () => {
	return (
		<>
			{/* radio select with "url" and "json" as options */}
			{html`
				<main class="homepage_container" x-data="{ open: '' }">
					<p>Select a reference mode:</p>
					<div class="mode_selector">
						<div>
							<input
								type="radio"
								id="fromURL"
								name="mode"
								value="url"
								x-data
								x-on:change="open = 'url'; console.log($event.target.value)"
							/>
							<label for="fromURL">From URL</label>
						</div>
						<div>
							<input
								type="radio"
								id="fromJSON"
								name="mode"
								value="json"
								x-data
								x-on:change="open = 'json'; console.log($event.target.value)"
							/>
							<label for="fromJSON">From JSON</label>
						</div>
					</div>

					<br />
					<form x-show="open === 'url'">
						<label htmlFor="referenceUrl">Reference URL</label>
						<input
							type="text"
							id="referenceUrl"
							name="referenceUrl"
							placeholder="https://example.com/swagger/v1/swagger.json"
						/>
					</form>

					<form x-show="open === 'json'">
						<label htmlFor="referenceContent">Reference Content</label>
						<textarea
							type="text"
							id="referenceContent"
							name="referenceContent"
						></textarea>
					</form>
				</main>
			`}
			{/* <script src="/static/home-script.js" type="module"></script> */}
		</>
	);
};
