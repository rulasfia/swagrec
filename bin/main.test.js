import { test } from "node:test";
import assert from "node:assert";
import { parse_from_remote_url } from "./main.js";

test("Given a string, it should differentiate between valid & invalid url string & return fetch response", async () => {
	const url = "https://jsonplaceholder.typicode.com/posts/1";

	const result = await parse_from_remote_url(url);

	assert.strictEqual(result.status, 200);
	assert.strictEqual(typeof (await result.json()), "object");
});
