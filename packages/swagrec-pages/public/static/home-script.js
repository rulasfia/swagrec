const from_url_ref = document.getElementById("fromURL");
const from_json_ref = document.getElementById("fromJSON");
const url_form_ref = document.getElementById("url_form");

function change_mode_handler(e) {
	const mode = e.target.value;
	console.log("mode:", e.target.value);

	if (mode === "url") {
		url_form_ref.style.display = "block";
	}
}

from_url_ref.addEventListener("change", change_mode_handler);
from_json_ref.addEventListener("change", change_mode_handler);
