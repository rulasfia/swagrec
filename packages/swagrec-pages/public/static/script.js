"use strict";

let selected_endpoints = [];

const endpoint_selector_ref = document.getElementById("endpoint_selector");
const selected_endpoints_ref = document.getElementById("selected_endpoints");
const gen_json_btn_ref = document.getElementById("generate_json_button");
const result_content_ref = document.getElementById("result_content");
const copy_result_btn_ref = document.getElementById("copy_result_button");
const coppied_status_ref = document.getElementById("coppied_status");

let result;

// event that triggers whenever selected endpoints change
if (endpoint_selector_ref) {
	endpoint_selector_ref.addEventListener("change", (e) => {
		const selected = endpoint_selector_ref.querySelectorAll("input:checked");

		if (selected.length > 0) {
			gen_json_btn_ref.disabled = false;
		} else {
			gen_json_btn_ref.disabled = true;
		}

		// update the selected endpoints list array & data
		let element_list = "";
		const local_selected = [];
		for (const endpoint of selected) {
			const data = JSON.parse(endpoint.value);
			local_selected.push(data);

			element_list += `<li>[${data.method.toUpperCase()}] ${data.path}</li>`;
		}

		// update the selected endpoints element_list
		selected_endpoints_ref.innerHTML = element_list;
		selected_endpoints = local_selected;
	});
}

// on button click, request server to generate JSON
// based on selected endpoints
gen_json_btn_ref.addEventListener("click", async () => {
	// clear result content
	result_content_ref.innerText = "";

	try {
		const response = await fetch("/api/generate", {
			method: "POST",
			body: JSON.stringify({ endpoints: selected_endpoints }),
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (response.status === 200) {
			const data = await response.json();
			result = data;
			result_content_ref.innerHTML = JSON.stringify(data, null, 2);
			copy_result_btn_ref.disabled = false;
		} else {
			console.error("Error generating JSON");
		}
	} catch (error) {
		console.error("Error generating JSON", error);
	}
});

copy_result_btn_ref.addEventListener("click", () => {
	navigator.clipboard.writeText(JSON.stringify(result, null, 2));

	coppied_status_ref.style.display = "block";

	setTimeout(() => {
		coppied_status_ref.style.display = "none";
	}, 1000);
});
