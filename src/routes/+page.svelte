<script lang="ts">
	import { goto } from '$app/navigation';

	type FormEvent = SubmitEvent & { currentTarget: EventTarget & HTMLFormElement };
	function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		if (!form.get('json')) {
			alert('Please enter JSON content');
			return;
		}
		localStorage.setItem('json', form.get('json') as string);
		return goto('/parser');
	}
</script>

<main class="container mx-auto py-4">
	<form class="mt-8 flex flex-col gap-y-4" onsubmit={handleSubmit}>
		<label for="json">Enter JSON content here:</label>
		<textarea
			name="json"
			id="json"
			class="max-w-md rounded border p-2 dark:bg-neutral-800"
			rows="10"
		></textarea>
		<button
			type="submit"
			class="w-fit rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
		>
			Submit
		</button>
	</form>
</main>
