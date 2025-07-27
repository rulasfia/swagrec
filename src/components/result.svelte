<script lang="ts">
	const { result = '' } = $props();

	let copied = $state(false);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(result);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	};
</script>

<section>
	<div class="flex h-9 flex-row items-center justify-between">
		<h2>Generated Definition</h2>
		<button
			onclick={copyToClipboard}
			class="cursor-pointer rounded-sm bg-sky-600 px-3 py-0.5 text-sm font-medium text-white shadow-sm hover:bg-sky-600/90"
			disabled={copied}
		>
			{copied ? 'Copied!' : 'Copy'}
		</button>
	</div>
	<textarea
		value={result}
		class="dark: h-[calc(100vh-94px)] w-full rounded-sm border-neutral-300 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
		disabled
	></textarea>
</section>
