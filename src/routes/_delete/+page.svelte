<script>
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import { db } from '$lib/firebase.js';
	import { collection, getDocs, writeBatch } from 'firebase/firestore';

	let status = $state('working'); // working | error
	let errorMsg = $state('');

	async function deleteAll() {
		status = 'working';
		try {
			const snap = await getDocs(collection(db, 'submissions'));
			const docs = snap.docs;
			// A Firestore batch is limited to 500 writes, so delete in chunks.
			for (let i = 0; i < docs.length; i += 500) {
				const batch = writeBatch(db);
				for (const d of docs.slice(i, i + 500)) batch.delete(d.ref);
				await batch.commit();
			}
			// Deletion done — send the user straight to the stats page.
			await goto(base + '/stats');
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : String(e);
			status = 'error';
		}
	}

	// Hitting this endpoint deletes everything in `submissions`.
	onMount(deleteAll);
</script>

<h1>Suppression</h1>

{#if status === 'working'}
	<p>Suppression de toutes les données…</p>
{:else if status === 'error'}
	<p class="banner err">Erreur&nbsp;: {errorMsg}</p>
	<button onclick={deleteAll}>Réessayer</button>
{/if}

<style>
	.banner {
		padding: 0.8rem 1rem;
		border-radius: 6px;
	}
	.banner.err {
		background: #fdecec;
	}
	button {
		padding: 0.6rem 1rem;
		font-size: 1rem;
		font-weight: 600;
		color: #fff;
		background: #b00020;
		border: 0;
		border-radius: 6px;
		cursor: pointer;
	}
</style>
