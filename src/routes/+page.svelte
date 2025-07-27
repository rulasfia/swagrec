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
	<form class="mx-auto mt-8 flex max-w-lg flex-col gap-y-4" onsubmit={handleSubmit}>
		<div class="flex flex-row items-center justify-between">
			<label for="json">Enter JSON content here:</label>
			<button
				type="submit"
				class="w-fit rounded bg-sky-600 px-4 py-1 text-sm font-medium text-white hover:bg-sky-600/90"
			>
				Parse →
			</button>
		</div>
		<textarea
			name="json"
			id="json"
			class="rounded border border-neutral-400 p-2 text-sm dark:border-neutral-500 dark:bg-neutral-800"
			rows="20"
		></textarea>
	</form>
</main>
