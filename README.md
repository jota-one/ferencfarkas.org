# The ferencfarkas.org project

The **ferencfarkas.org** project aims to promote the work of hungarian classical music composer
**Ferenc Farkas** (1905 - 2000).

## Goals of the project

The **ferencfarkas.org** project is a website with 3 main goals in mind:

- Provide as many detailed informations and material as possible about Ferenc Farkas to the public.
- Help people know and listen to Farkas's music.
- Connect with other people to promote Farkas's work and make his music played over the world.

## Roadmap
### Planned
#### Infrastructure

- [x] **Svelte 5 / Typescript migration**
- [ ] **Hugo upgrade**: update to latest stable version (`0.161.1` at the time of writing).

### Catalogue

- [ ] **Bulk audio download (ZIP)**: allow visitors to download all available audio excerpts as a single ZIP archive.
- [ ] **Favorites**: allow visitors to manage a list of favorite works (localstorage on persisted on a dedicated database)
- [ ] **Duration filter improvements**: replace the current coarse duration buckets with a range slider for more precise
filtering.

### Content

- [ ] **Discover / Media archive section**: develop the currently placeholder `/discover` page into a full media archive
covering:
  - **Galleries** — historical photographs (many already used in the biography), scanned documents, manuscripts
  - **Books** — bibliography, including *Mon père m'a raconté…* (FR) / *Vallomások a zenéről* (HU)
  - **Articles & interviews** — press reviews, musicological essays, radio/TV interviews
  - **Films** — Farkas composed music for 73 films; a filmography with stills and credits
  - **CD discography** — all commercial recordings with cover art and tracklist linking back to catalogue works

  High-resolution assets (photos, score excerpts, press kit materials) should be available for
  download by concert programmers and conference organisers.


### Under consideration
#### Catalogue

- [ ] **Multilingual UI**: the catalogue titles are already multilingual. Extending the UI itself
  to French and Hungarian would serve the core audience (family, Hungarian institutions, French
  and Italian musicological communities).
- [ ] **Score preview**: render the first page of a downloadable score as an inline image so
  visitors can preview before downloading.

#### Content

- [ ] **Interactive chronological timeline**: an interactive timeline combining life events and works (filterable by
period or category) would give a compelling entry point for new visitors and students.
- [ ] **Notable students section**: Farkas taught at the Budapest Music Academy from 1949 to 1975. His students include
  György Ligeti, György Kurtág, Emil Petrovics, Sándor Szokolay, Zsolt Durkó, Attila Bozay, Miklós Kocsár —
  placing him at the very heart of 20th-century Hungarian music history. A short dedicated page would help
  contextualise his importance for broader audiences.
- [ ] **"Similar works" suggestions**: use category, instrumentation, and composition period to
  surface related works at the bottom of each work detail page.
- [ ] **Press kit / artist page**: a dedicated, printable page for promoters: biography summary, portrait photos,
catalogue highlights, key awards (Kossuth Prize ×3, Herder Prize, …), and contact.

#### SEO & visibility

- [ ] **Structured data (schema.org)**: add `MusicComposition` and `Person` JSON-LD markup to work pages and the
  biography => this is the highest-leverage SEO improvement. It helps Google surface individual works
  directly in search results and qualify the site for the Knowledge Panel.
  The target audience (conductors, musicologists, students) uses precise queries
  ("Ferenc Farkas scores", "Early Hungarian Dances sheet music") where organic ranking
  should outperform paid search.

#### Developer / data

- [ ] **Public catalogue API (v2)**: The current JSON endpoints are generated statically and optimised for the webapp
  (pre-computed facets, stripped fields). A proper public API would expose the full work
  data with stable, versioned endpoints (`/api/v1/works/{id}`, `/api/v1/works?category=…&from=…`).
  Two approaches: generate a richer set of per-work JSON files at build time via Hugo,
  or introduce a lightweight server-side layer. Useful for music libraries, musicology
  research, and digital humanities projects.
- [ ] **Embeddable player widget**: a lightweight JS snippet that any concert programme or music
  blog could drop in to play a Farkas excerpt, with attribution back to the site.
