# cours-form-submit

A small static [SvelteKit](https://svelte.dev/) app, hosted on GitHub Pages, that
stores form submissions in [Cloud Firestore](https://firebase.google.com/docs/firestore)
and shows them live.

## Pages

- **`/`** — a form submitted with `method="GET"`. The fields are encoded in the URL
  query string; the page reads them in the browser and writes
  `{ timestamp, payload, metadata }` to the `submissions` collection in Firestore.
- **`/stats`** — lists every document in `submissions`, subscribed with Firestore's
  `onSnapshot` so it updates **live** as new submissions arrive.

> **Why GET?** GitHub Pages serves static files only — it cannot read a POST body.
> A GET form puts its data in the URL, which static client-side JS _can_ read, so
> the form can even be hosted on another site as long as it posts to this page with
> `method="GET"`. The trade-off: data is limited to what fits in a URL, is visible
> in browser history/logs, and can't include file uploads. Don't send secrets.

## Submitting from an external form

```html
<form action="https://nwolff.github.io/cours-form-submit/" method="GET">
  <input name="nom" />
  <input name="message" />
  <button type="submit">Envoyer</button>
</form>
```

## Local development

Connect your machine to Firestore (one time):

    gcloud config set project cours-form-submit
    gcloud auth application-default login

Then:

    npm install
    npm run dev        # http://localhost:5173
    npm run build      # static build into ./build
    npm run preview    # serve the production build locally

Locally the site runs at the root path. The production build is served under
`/cours-form-submit/`; the deploy workflow sets `BASE_PATH` for that automatically.

## Firebase configuration

The Firebase web config in [src/lib/firebase.js](src/lib/firebase.js) contains only
public client identifiers (apiKey, projectId, …). These are not secrets — access is
controlled by the security rules in [firestore.rules](firestore.rules).

The current rules are **open for demo use**: anyone can create a submission and read
all submissions; nobody can edit or delete from the client. Tighten them before any
real use.

## Deployment

Pushing to `main` triggers [.github/workflows/deploy.yml](.github/workflows/deploy.yml),
which builds the static site and publishes it to GitHub Pages.

**One-time setup:** in the repo on GitHub, go to **Settings → Pages → Build and
deployment → Source** and select **GitHub Actions**.

The site will be available at <https://nwolff.github.io/cours-form-submit/>.
