<script>
	import { onMount } from 'svelte';
	import { db } from '$lib/firebase.js';
	import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

	let submissions = $state([]);
	let loading = $state(true);
	let error = $state('');
	let showAll = $state(false);

	const ONE_HOUR_MS = 60 * 60 * 1000;

	// By default only show submissions from the last hour; the button reveals all.
	// A pending serverTimestamp (not yet resolved) is treated as "just now".
	let visible = $derived(
		showAll
			? submissions
			: submissions.filter((s) => {
					if (!s.timestamp?.toDate) return true;
					return Date.now() - s.timestamp.toDate().getTime() < ONE_HOUR_MS;
				})
	);

	onMount(() => {
		const q = query(collection(db, 'submissions'), orderBy('timestamp', 'desc'));
		// onSnapshot delivers the current data immediately and then pushes every
		// change live. Returning the unsubscribe function lets onMount clean it up.
		const unsubscribe = onSnapshot(
			q,
			(snap) => {
				submissions = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
				loading = false;
			},
			(e) => {
				error = e.message;
				loading = false;
			}
		);
		return unsubscribe;
	});

	function formatTime(ts) {
		if (!ts?.toDate) return '…'; // serverTimestamp not yet resolved
		return ts.toDate().toLocaleString('fr-CH');
	}

	// Show a value without JSON quotes/curlies. Nested objects/arrays still get
	// stringified so they remain readable.
	function formatValue(v) {
		if (v === null || v === undefined) return '—';
		if (typeof v === 'object') return JSON.stringify(v);
		return String(v);
	}
</script>

{#snippet keyValues(obj)}
	{#each Object.entries(obj ?? {}) as [k, v]}
		<div class="kv"><span class="k">{k}</span> : {formatValue(v)}</div>
	{/each}
{/snippet}

<h1>Statistiques</h1>
<p>
	{visible.length} donnée(s){showAll ? '' : ' dans la dernière heure'} — mise à jour en direct.
	{#if !showAll && submissions.length > visible.length}
		<button onclick={() => (showAll = true)}>
			Tout afficher ({submissions.length})
		</button>
	{:else if showAll}
		<button onclick={() => (showAll = false)}>Dernière heure seulement</button>
	{/if}
</p>

{#if error}
	<p class="err">Erreur&nbsp;: {error}</p>
{:else if loading}
	<p>Chargement…</p>
{:else if visible.length === 0}
	<p>Aucune donnée {showAll ? "pour l'instant" : 'dans la dernière heure'}.</p>
{:else}
	<table>
		<colgroup>
			<!-- Date and Données stay compact; Métadonnées (unsized) absorbs the
			     remaining width, so it widens as the window grows. -->
			<col class="col-date" />
			<col class="col-data" />
			<col />
		</colgroup>
		<thead>
			<tr>
				<th>Date</th>
				<th>Données</th>
				<th>Métadonnées</th>
			</tr>
		</thead>
		<tbody>
			{#each visible as s (s.id)}
				<tr>
					<td>{formatTime(s.timestamp)}</td>
					<td>{@render keyValues(s.payload)}</td>
					<td>{@render keyValues(s.metadata)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style>
	/* The default layout caps content at 720px. The stats table — especially the
	   metadata column (long userAgent strings, etc.) — needs more room, so widen
	   the layout's content column on this route and let it grow with the viewport,
	   up to a cap. Set on :root so it inherits down to <main> regardless of
	   selector specificity; only applies while the stats page is mounted. */
	:global(:root) {
		--content-width: min(96vw, 1100px);
	}
	table {
		width: 100%;
		table-layout: fixed;
		border-collapse: collapse;
		margin-top: 1rem;
	}
	.col-date {
		width: 11rem;
	}
	.col-data {
		width: 18rem;
	}
	th,
	td {
		text-align: left;
		padding: 0.6rem;
		border-bottom: 1px solid #e2e2e2;
		vertical-align: top;
		/* Let long values (e.g. a userAgent string) wrap instead of overflowing. */
		overflow-wrap: anywhere;
	}
	th {
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #666;
	}
	.kv {
		font-size: 0.85rem;
		margin-bottom: 0.15rem;
	}
	.k {
		font-weight: 600;
		color: #444;
	}
	.err {
		color: #b00020;
	}
	button {
		margin-left: 0.5rem;
		padding: 0.25rem 0.6rem;
		font-size: 0.85rem;
		color: #2563eb;
		background: #eef;
		border: 1px solid #cbd5f5;
		border-radius: 6px;
		cursor: pointer;
	}
</style>
