import { FC, Fragment } from "hono/jsx";

type ComponentProps = {
	defaultReferenceUrl?: string;
	referenceContent?: string;
	error?: string;
	endpoints?: {
		method: string;
		path: string;
	}[];
};

export const FromURLPage: FC<ComponentProps> = ({
	defaultReferenceUrl,
	referenceContent,
	error,
	endpoints,
}: ComponentProps) => {
	return (
		<Fragment>
			<main class="main_column">
				<section>
					<form>
						<label for="referenceUrl">Reference URL</label>
						<div>
							<input
								type="text"
								id="referenceUrl"
								name="referenceUrl"
								placeholder="https://example.com"
								value={defaultReferenceUrl}
							/>
							<button type="submit">Submit</button>
						</div>
						{defaultReferenceUrl && error ? (
							<span class="error_msg">{error}</span>
						) : null}
					</form>

					<br />

					{endpoints?.length && endpoints.length > 0 ? (
						<>
							<span>Select Endpoint</span>
							<div class="endpoint_selector" id="endpoint_selector">
								{/* endpoint selector as checkbox */}
								{endpoints?.map((endpoint) => {
									const key = `endpoint_${endpoint.method}_${endpoint.path}`;

									return (
										<div>
											<input
												type="checkbox"
												id={key}
												name={key}
												value={JSON.stringify(endpoint)}
											/>
											<label for={key}>
												{`[${endpoint.method.toUpperCase()}] ${endpoint.path}`}
											</label>
										</div>
									);
								})}
							</div>
						</>
					) : null}

					<br />

					<div class="form_control">
						<label for="reference_content">Reference Preview</label>
						<textarea
							id="reference_content"
							name="reference_content"
							rows={19}
							disabled
						>
							{referenceContent}
						</textarea>
					</div>
				</section>
				<section>
					<div>
						<span>Selected Endpoint</span>
						<ul class="selected_endpoints" id="selected_endpoints"></ul>
					</div>

					<button
						class="generate_json_button"
						id="generate_json_button"
						disabled
					>
						Generate JSON
					</button>

					<br />
					<br />
					<div>
						<textarea
							id="result_content"
							name="result_content"
							rows={19}
							disabled
						></textarea>
					</div>
					<br />
					<div>
						<button id="copy_result_button" disabled>
							Copy to Clipboard
						</button>
						<span id="coppied_status" style={{ display: "none" }}>
							Copied!
						</span>
					</div>
				</section>
			</main>
			<script src="/static/script.js" type="module"></script>
		</Fragment>
	);
};
