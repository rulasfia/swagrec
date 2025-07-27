<script lang="ts">
	const { result = '' } = $props();

	let copied = $state(false);
	let mode = $state<'tree' | 'raw'>('tree');

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

	$effect(() => {
		if (!renderjson || mode !== 'tree') return;
		const resElement = document.getElementById('res');
		resElement?.replaceChildren();

		const content = JSON.parse(result === '' ? '{}' : result);

		renderjson.set_show_to_level(1);
		const child = renderjson(content);

		resElement?.appendChild(child);

		return () => {
			resElement?.replaceChildren();
		};
	});
</script>

<section>
	<div class="flex h-9 flex-row items-center justify-between">
		<h2>Generated Definition</h2>
		<div class="flex items-center text-sm font-medium">
			<button
				class="rounded-l-sm border border-neutral-500 px-3 py-0.5 text-sm text-neutral-700 data-[active=true]:bg-sky-200 dark:text-neutral-300 dark:data-[active=true]:bg-sky-800"
				data-active={mode === 'tree'}
				onclick={() => (mode = 'tree')}>Tree</button
			>
			<button
				class="mr-2 rounded-r-sm border border-neutral-500 border-l-transparent px-3 py-0.5 text-sm text-neutral-700 data-[active=true]:bg-sky-200 dark:text-neutral-300 dark:data-[active=true]:bg-sky-800"
				data-active={mode === 'raw'}
				onclick={() => (mode = 'raw')}>Raw</button
			>

			<button
				onclick={copyToClipboard}
				class="cursor-pointer rounded-sm border border-solid border-sky-600 bg-sky-600 px-3 py-0.5 text-sm text-white shadow-sm hover:bg-sky-600/90"
				disabled={copied}
			>
				{copied ? 'Copied!' : 'Copy JSON'}
			</button>
		</div>
	</div>
	{#if mode === 'raw'}
		<textarea
			value={result}
			class="dark: h-[calc(100vh-94px)] w-full rounded-sm border-neutral-300 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
			disabled
		></textarea>
	{/if}
	{#if mode === 'tree'}
		<div
			id="res"
			class="h-[calc(100vh-94px)] w-full overflow-y-scroll rounded-sm border border-solid border-neutral-300 p-2 font-mono text-sm dark:border-neutral-600 dark:bg-neutral-800"
		></div>
	{/if}
</section>

<style>
</style>
