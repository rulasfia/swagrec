import { action, redirect } from "@solidjs/router";

export const urlAction = action(async (formData: FormData) => {
	console.log({ formData }, formData.get("reference_url"));
	redirect("/from-url?reference_url=" + formData.get("reference_url"), 1);
}, "urlAction");
