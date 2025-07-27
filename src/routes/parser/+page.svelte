<script lang="ts">
	import { goto } from '$app/navigation';
	import { extractSchemasFromPaths, filterSwaggerJson, parseSwaggerJson } from '$lib/parser';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import Result from '../../components/result.svelte';

	let paths = $state<{ [key: string]: unknown }>({});
	let schemas = $state<{ [key: string]: unknown }>({});

	let selectedPaths = new SvelteSet<string>();
	let selectedSchemas = $derived.by(() => {
		return extractSchemasFromPaths({ paths, schemas }, Array.from(selectedPaths));
	});

	let result = $state('');

	onMount(() => {
		const content = localStorage.getItem('json');
		if (!content) return goto('/');

		const parsed = parseSwaggerJson(content ?? '{}');
		console.log('parsed', parsed);

		paths = parsed.paths;
		schemas = parsed.schemas;
	});

	function onSubmit() {
		const content = localStorage.getItem('json') as string;
		result = filterSwaggerJson(content, Array.from(selectedPaths));
	}
</script>

<main class="container mx-auto grid grid-cols-2 gap-8 py-2">
	<section>
		<div class="flex h-9 flex-row items-center justify-between">
			<h2>Available APIs</h2>
			<button
				type="submit"
				onclick={onSubmit}
				class="cursor-pointer rounded-sm bg-sky-600 px-3 py-0.5 text-sm text-white shadow-sm hover:bg-sky-600/90"
				>Generate Definition →</button
			>
		</div>
		<ul
			class="flex h-[calc(calc(100vh-136px)/2)] flex-col gap-y-1 overflow-y-scroll rounded-sm border border-solid border-neutral-300 p-2 font-mono text-sm"
		>
			{#each Object.entries(paths) as [k] (k)}
				<li class="flex flex-row items-center gap-x-1 rounded-sm px-1 text-sm hover:bg-sky-100">
					<input
						type="checkbox"
						id={k}
						onchange={() => (selectedPaths.has(k) ? selectedPaths.delete(k) : selectedPaths.add(k))}
					/><label for={k}>{k}</label>
				</li>
			{/each}
		</ul>

		<div class="mt-2 grid h-[32px] grid-cols-2 items-center gap-2">
			<h2 class="">Selected APIs</h2>
			<h2 class="">Selected Schemas</h2>
		</div>
		<div class="grid h-[calc(calc(100vh-136px)/2)] grid-cols-2 gap-x-2">
			<ul
				class="flex flex-col gap-y-1 overflow-y-scroll rounded-sm border border-solid border-neutral-300 p-2 font-mono text-sm"
			>
				{#each selectedPaths as k (k)}
					<li class="flex flex-row items-center gap-x-1">
						✅ {k}
					</li>
				{/each}
			</ul>
			<ul
				class="flex h-full list-outside list-disc flex-col gap-y-0.5 overflow-y-scroll rounded-sm border border-solid border-neutral-300 p-2 font-mono text-sm"
			>
				{#each Object.entries(selectedSchemas) as [k] (k)}
					<li class="flex flex-row items-center gap-x-1">
						- {k}
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<Result {result} />
</main>
