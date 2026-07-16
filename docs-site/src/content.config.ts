import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	// Read the project's docs directly from /docs at the repo root, so the
	// website is generated from the same Markdown files developers read on
	// GitHub. README.md becomes the site's index/home page.
	docs: defineCollection({
		loader: glob({
			// Non-recursive: docs/ also holds project-site/ (a separate Next.js
			// project's source, with its own node_modules) and screens/
			// (image assets), neither of which should be walked as doc pages.
			pattern: '*.md',
			base: '../docs',
			generateId: ({ entry }) => (entry === 'README.md' ? 'index' : entry.replace(/\.md$/, '')),
		}),
		schema: docsSchema(),
	}),
};
