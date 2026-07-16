// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { remarkDocLinks } from './src/remark-doc-links.mjs';

// https://astro.build/config
export default defineConfig({
	// GitHub Pages serves project sites from https://<user>.github.io/<repo>/
	site: 'https://symonxdd.github.io',
	base: '/ds4-dashboard',
	markdown: {
		remarkPlugins: [remarkDocLinks],
	},
	integrations: [
		starlight({
			title: 'DS4 Dashboard',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/symonxdd/ds4-dashboard' },
			],
			sidebar: [
				{ label: 'Overview', link: '/' },
				{ label: 'Architecture', link: '/architecture/' },
				{ label: 'Features', link: '/features/' },
				{ label: 'Bugs & Quirks Fixed', link: '/bugs-and-quirks/' },
			],
		}),
	],
});
