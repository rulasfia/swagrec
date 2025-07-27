<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<header
	class="container mx-auto flex h-10 items-center justify-between border-b border-solid border-neutral-200 dark:border-neutral-700"
>
	<a href="/" class="text-lg font-semibold">Swagrec</a>
	<div class="flex items-center justify-end gap-x-2">
		<a href="https://github.com/rulasfia/swagrec" class="font text-sm hover:underline"> Github </a>
	</div>
</header>

{@render children()}
