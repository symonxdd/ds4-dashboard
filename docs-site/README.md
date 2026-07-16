# DS4 Dashboard docs site

This is a [Starlight](https://starlight.astro.build/) (Astro) site that turns the Markdown files in [/docs](../docs/) into a browsable documentation website, published at https://symonxdd.github.io/ds4-dashboard/.

## What are Astro and Starlight?

- **[Astro](https://astro.build/)** is a web framework for building content-focused websites (docs, blogs, marketing sites). It handles routing, the dev server, and building everything down to static HTML/CSS with minimal JS. You write pages as `.astro`/`.md`/`.mdx` files.
- **[Starlight](https://starlight.astro.build/)** is an official Astro integration, basically a "docs site in a box" built on top of Astro. It's added as a dependency (`@astrojs/starlight`) and registered in [astro.config.mjs](astro.config.mjs)'s `integrations` array. Starlight provides the whole docs UI for free: sidebar navigation, search, light/dark theme toggle, previous/next links, table of contents, etc, so all that's left to do is supply Markdown content and a sidebar config.

In short: Astro is the general-purpose framework, Starlight is a docs-specific layer on top of it. A plain Astro project could be a blog or portfolio with none of the above; this project uses Astro *because* Starlight needs it.

## How it's wired up

There's no separate copy of the docs. [src/content.config.ts](src/content.config.ts) points Starlight's content loader straight at `../docs`, so every `.md` file in the repo's `docs/` folder becomes a page here:

| File in `/docs` | Page |
|---|---|
| `README.md` | `/` (home page) |
| `architecture.md` | `/architecture/` |
| `features.md` | `/features/` |
| `bugs-and-quirks.md` | `/bugs-and-quirks/` |

Each of those files needs a `title` (and optionally a `description`) in a small YAML frontmatter block at the top, which Starlight uses for the page title, browser tab title, and `<meta>` description. The sidebar in [astro.config.mjs](astro.config.mjs) lists those pages explicitly, so a new file in `/docs` needs a line added there too to show up in the sidebar.

The `.md` files also link to each other using plain filenames (e.g. `[architecture.md](architecture.md)`), which is what works when browsing `/docs` on GitHub. [src/remark-doc-links.mjs](src/remark-doc-links.mjs) rewrites those links at build time to the matching Starlight route (e.g. `architecture/`), so the same links work on both GitHub and the built site.

## Commands

Run these from inside `docs-site/`:

| Command | What it does |
|---|---|
| `npm install` | Installs dependencies (only needed once, or after `package.json` changes) |
| `npm run dev` | Starts a local dev server at `http://localhost:4321/ds4-dashboard/` with live reload |
| `npm run build` | Builds the static site into `dist/` |
| `npm run preview` | Serves the built `dist/` locally, to sanity-check a production build |

## Editing the docs

Edit the `.md` files in `/docs` as normal. With `npm run dev` running, the site picks up changes and reloads automatically, same as editing any other Astro/Starlight content.

## Deployment

[.github/workflows/deploy-docs.yml](../.github/workflows/deploy-docs.yml) builds this site and publishes it to GitHub Pages whenever `docs/` or `docs-site/` change on `main` (or it can be run manually from the Actions tab). There's no manual "redeploy" step: push to `main` and the workflow rebuilds and republishes the site within a minute or two.

For this to work, GitHub Pages needs to be enabled once for the repo, under **Settings → Pages → Build and deployment → Source: GitHub Actions**. The `site`/`base` values in [astro.config.mjs](astro.config.mjs) assume the repo lives at `github.com/symonxdd/ds4-dashboard`; update them if that's not where it ends up.
