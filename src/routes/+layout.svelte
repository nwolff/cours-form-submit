<script>
	import { base } from '$app/paths';

	let { children } = $props();
</script>

<header>
	<nav>
		<a href="{base}/">Formulaire</a>
		<a href="{base}/stats">Statistiques</a>
	</nav>
</header>

<main>
	{@render children()}
</main>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui, sans-serif;
		color: #1a1a1a;
		background: #fafafa;
	}
	header {
		background: #1a1a1a;
	}
	nav {
		max-width: 720px;
		margin: 0 auto;
		display: flex;
		gap: 1.5rem;
		padding: 0.9rem 1rem;
	}
	nav a {
		color: #fff;
		text-decoration: none;
		font-weight: 600;
	}
	nav a:hover {
		text-decoration: underline;
	}
	main {
		/* Pages can widen the content column by setting --content-width
		   (see e.g. the stats route, which needs room for wide tables). */
		max-width: var(--content-width, 720px);
		margin: 0 auto;
		padding: 1.5rem 1rem 3rem;
	}
</style>
