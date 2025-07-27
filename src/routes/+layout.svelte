<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<header
	class="container mx-auto flex h-10 items-center border-b border-solid border-neutral-200 text-lg font-semibold dark:border-neutral-700"
>
	<a href="/">Swagrec</a>
</header>

{@render children()}
