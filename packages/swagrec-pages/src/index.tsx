import { Hono } from "hono";
import { renderer } from "./renderer";
import { HomePage } from "./index.view";
import * as v from "valibot";
import {
	generateBodySchema,
	getEndpointList,
	getEssentialProps,
	getSelectedPath,
	getUniqueRefs,
	validate_body,
	validate_response_format,
} from "./utils";
import { getCookie, setCookie } from "hono/cookie";
import { validator } from "hono/validator";
import { FromURLPage } from "./from-url";

type Bindings = {
	SWAGREC_KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(renderer);

app.get("/", async (c) => {
	try {
		// generate and restore unique id and store it in cookie
		let requestId = getCookie(c, "rid");

		if (requestId) {
			// clear kv if requestId exists
			await c.env.SWAGREC_KV.delete(requestId);
		} else {
			requestId = crypto.randomUUID();
			setCookie(c, "rid", requestId);
		}

		return c.render(<HomePage />);

		// handle error
	} catch (error) {
		console.log(error);
		let message = "Something went wrong";
		if (error instanceof v.ValiError) message = error.message;
		if (error instanceof Error) message = error.message;

		return c.render(<HomePage error={message} />);
	}
});

app.get("/from-url", async (c) => {
	const referenceUrl = c.req.query("referenceUrl") ?? "";

	try {
		// generate and restore unique id and store it in cookie
		let requestId = getCookie(c, "rid");

		if (requestId) {
			// clear kv if requestId exists
			await c.env.SWAGREC_KV.delete(requestId);
		} else {
			requestId = crypto.randomUUID();
			setCookie(c, "rid", requestId);
		}

		// check if url valid
		const validUrl = v.parse(v.string([v.url()]), referenceUrl);

		const res = await fetch(validUrl);
		const referenceContentJSON = await validate_response_format(res);
		const referenceContent = JSON.stringify(referenceContentJSON, null, 2);

		// const referenceContentJSON = mockResponse as unknown;
		// const referenceContent = JSON.stringify(mockResponse, null, 2);

		const options = getEndpointList(
			referenceContentJSON as Record<string, string>,
		);

		// store content in kv with requestId as key
		await c.env.SWAGREC_KV.put(requestId, referenceContent);

		return c.render(
			<FromURLPage
				defaultReferenceUrl={referenceUrl}
				referenceContent={referenceContent}
				endpoints={options}
			/>,
		);

		// handle error
	} catch (error) {
		console.log(error);
		let message = "Something went wrong";
		if (error instanceof v.ValiError) message = error.message;
		if (error instanceof Error) message = error.message;

		return c.render(
			<FromURLPage defaultReferenceUrl={referenceUrl} error={message} />,
		);
	}
});

app.post("/api/generate-from-json", async (c) => {
	try {
		const requestId = getCookie(c, "rid");
		if (!requestId) {
			c.status(400);
			return c.json({ error: "No requestId found" });
		}
		console.log(c.req.url, requestId);

		const body = await c.req.json();

		const referenceContentJSON = await validate_body(body);
		const referenceContent = JSON.stringify(referenceContentJSON, null, 2);

		await c.env.SWAGREC_KV.put(requestId, referenceContent);

		return c.json({ success: true });
	} catch (error) {
		console.log(error);
		c.status(400);
		return c.json({ error: "Invalid request body" });
	}
});

app.post(
	"/api/generate-output",
	// validate request body
	validator("json", (body, c) => {
		console.log(JSON.stringify(body));
		const parsed = v.safeParse(generateBodySchema, body);
		if (!parsed.success) {
			c.status(400);
			return c.json({ error: parsed.issues });
		}

		return parsed.output;
	}),
	async (c) => {
		const requestId = getCookie(c, "rid");
		if (!requestId) {
			c.status(400);
			return c.json({ error: "No requestId found" });
		}

		const referenceContent = (await c.env.SWAGREC_KV.get(requestId)) ?? "";
		const referenceContentJSON: Record<string, unknown> =
			JSON.parse(referenceContent);

		if (!referenceContentJSON) {
			c.status(400);
			return c.json({ error: "Invalid reference content" });
		}

		// pick essential properties from referenceContentJSON
		const res = getEssentialProps(referenceContentJSON);

		const body = await c.req.json<v.Output<typeof generateBodySchema>>();

		// format selected paths
		const paths = getSelectedPath(referenceContentJSON, body.endpoints);
		const refs = getUniqueRefs(referenceContentJSON, paths);

		res.paths = paths;
		(res.components as Record<string, unknown>).schemas = refs;

		return c.json(res);
	},
);

export default app;
