# Roadmap

This document tracks planned features and improvements for [ferencfarkas.org](https://ferencfarkas.org).
Contributions and suggestions are welcome via [GitHub issues](https://github.com/jota-one/ferencfarkas.org/issues).

---

## In progress

- **Svelte 5 / TypeScript migration** — Ongoing rewrite of the catalogue webapp with full type safety, reactive URL state, and browser history support for rework navigation.

---

## Planned

### Catalogue

- **Bulk audio download (ZIP)**
  Allow visitors to download all available audio excerpts as a single ZIP archive.
  Requires a serverless function (AWS Lambda or Cloud Run) on `fn.ferencfarkas.org`
  to collect excerpts from `media.ferencfarkas.org` and stream the archive on the fly.

- **Duration filter improvements**
  Replace the current coarse duration buckets with a range slider for more precise filtering.

### Discover / Media archive

- **"Around him" section**
  Develop the currently placeholder `/discover` page into a full media archive covering:
  - **Galleries** — historical photographs (many already used in the biography), scanned documents, manuscripts
  - **Books** — bibliography, including *Mon père m'a raconté…* (FR) / *Vallomások a zenéről* (HU)
  - **Articles & interviews** — press reviews, musicological essays, radio/TV interviews
  - **Films** — Farkas composed music for 73 films; a filmography with stills and credits
  - **CD discography** — all commercial recordings with cover art and tracklist linking back to catalogue works

  High-resolution assets (photos, score excerpts, press kit materials) should be available for
  download by concert programmers and conference organisers.

- **Press kit / artist page**
  A dedicated, printable page for promoters: biography summary, portrait photos,
  catalogue highlights, key awards (Kossuth Prize ×3, Herder Prize, …), and contact.

### Content & navigation

- **Interactive chronological timeline**
  The biography already tells a compelling century-spanning story. An interactive timeline
  combining life events and works (filterable by period or category) would give a compelling
  entry point for new visitors and students.

- **Notable students section**
  Farkas taught at the Budapest Music Academy from 1949 to 1975. His students include
  György Ligeti, György Kurtág, Emil Petrovics, Sándor Szokolay, Zsolt Durkó, Attila Bozay,
  Miklós Kocsár — placing him at the very heart of 20th-century Hungarian music history.
  A short dedicated page would help contextualise his importance for broader audiences.

### SEO & visibility

- **Structured data (schema.org)**
  Add `MusicComposition` and `Person` JSON-LD markup to work pages and the biography.
  This is the highest-leverage SEO improvement: it helps Google surface individual works
  directly in search results and qualify the site for the Knowledge Panel.
  The target audience (conductors, musicologists, students) uses precise queries
  ("Ferenc Farkas scores", "Early Hungarian Dances sheet music") where organic ranking
  should outperform paid search.

- **Paid promotion (Google Ads)**
  Consider targeted campaigns around specific events: new CD releases, anniversaries
  (born 15 December 1905, died 10 October 2000), major concerts. Less useful as a
  permanent fixture for an archive site; most effective as short bursts tied to news.

### Infrastructure

- **Hugo upgrade** — The site runs Hugo `0.74.3` (2020). Latest stable is `0.161.1`.
  Requires testing 40 custom templates against breaking changes (template lookup order in 0.123+,
  deprecated functions, goldmark defaults). Update locally first, then pin the new version in
  `netlify.toml` → `HUGO_VERSION`.

### Developer / data

- **Public catalogue API (v2)**
  The current JSON endpoints are generated statically and optimised for the webapp
  (pre-computed facets, stripped fields). A proper public API would expose the full work
  data with stable, versioned endpoints (`/api/v1/works/{id}`, `/api/v1/works?category=…&from=…`).
  Two approaches: generate a richer set of per-work JSON files at build time via Hugo,
  or introduce a lightweight server-side layer. Useful for music libraries, musicology
  research, and digital humanities projects.

---

## Ideas / under consideration

- **Embeddable player widget** — A lightweight JS snippet that any concert programme or music
  blog could drop in to play a Farkas excerpt, with attribution back to the site.

- **Multilingual UI** — The catalogue titles are already multilingual. Extending the UI itself
  to French and Hungarian would serve the core audience (family, Hungarian institutions, French
  and Italian musicological communities).

- **"Similar works" suggestions** — Use category, instrumentation, and composition period to
  surface related works at the bottom of each work detail page.

- **Score preview** — Render the first page of a downloadable score as an inline image so
  visitors can preview before downloading.
