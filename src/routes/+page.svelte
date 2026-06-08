<script>
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { db } from '$lib/firebase.js';
	import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

	// 'idle' = no submission in the URL, just show the usage instructions.
	let status = $state('idle'); // idle | saving | saved | error
	let errorMsg = $state('');
	let submitted = $state([]); // the [key, value] pairs that were received
	let canGoBack = $state(false); // is there a previous page to return to?

	onMount(async () => {
		// A GET form submission lands here as ?key=value&... in the URL.
		const params = new URLSearchParams(window.location.search);
		const entries = [...params.entries()];
		if (entries.length === 0) return; // direct visit, nothing to store

		const payload = Object.fromEntries(entries);
		submitted = entries;
		// history.length > 1 means there's a prior entry to return to (i.e. the
		// form was reached via navigation, not opened in a fresh tab).
		canGoBack = window.history.length > 1;
		status = 'saving';

		// Origin info, gathered in the browser. NOTE: all of this is client-supplied
		// and therefore spoofable — it is informational, not trustworthy evidence.
		const metadata = {
			url: window.location.href, // the full URL the form was submitted with
			userAgent: navigator.userAgent,
			language: navigator.language,
			referrer: document.referrer || null, // often origin-only or empty cross-site
			screen: `${screen.width}x${screen.height}`
		};

		try {
			await addDoc(collection(db, 'submissions'), {
				timestamp: serverTimestamp(),
				payload,
				metadata
			});
			status = 'saved';
			// Clear the query string so a page refresh doesn't store it twice.
			history.replaceState(null, '', base + '/');
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : String(e);
			status = 'error';
		}
	});
</script>

<h1>Formulaire</h1>

{#if status === 'saving'}
	<p class="banner">Enregistrement…</p>
{:else if status === 'saved'}
	<p class="banner ok">Données enregistrées&nbsp;!</p>

	<h2>Données reçues</h2>
	<table>
		<tbody>
			{#each submitted as [key, value]}
				<tr>
					<th>{key}</th>
					<td>{value}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<!-- Goes to the previous history entry (the page the form was submitted
	     from). Hidden when there's no history to go back to. -->
	{#if canGoBack}
		<p><button type="button" onclick={() => history.back()}>← Retour au formulaire</button></p>
	{/if}
{:else if status === 'error'}
	<p class="banner err">Erreur&nbsp;: {errorMsg}</p>
{:else}
	<p>
		Envoyez un formulaire <code>method="GET"</code> vers cette page pour enregistrer des
		données.
	</p>
{/if}

<style>
	.banner {
		padding: 0.8rem 1rem;
		border-radius: 6px;
		background: #eef;
	}
	.banner.ok {
		background: #e7f8ec;
	}
	.banner.err {
		background: #fdecec;
	}
	table {
		border-collapse: collapse;
	}
	th,
	td {
		padding: 0.3rem 0.8rem;
		border: 1px solid #ddd;
		text-align: left;
		vertical-align: top;
	}
	th {
		background: #f5f5f5;
	}
	button {
		font: inherit;
		color: #2563eb;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		text-decoration: underline;
	}
</style>
