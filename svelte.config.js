import adapter from '@sveltejs/adapter-static';

// On GitHub Pages a project site is served under /<repo-name>/.
// The deploy workflow sets BASE_PATH=/cours-form-submit; locally it stays ''.
const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Builds a fully static site. `404.html` is the SPA fallback that
		// GitHub Pages serves for any path it doesn't have a file for.
		adapter: adapter({ fallback: '404.html' }),
		paths: { base }
	}
};

export default config;
