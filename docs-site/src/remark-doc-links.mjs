import { visit } from 'unist-util-visit';
import path from 'node:path';

// /docs/*.md files link to each other using plain relative filenames
// (e.g. "architecture.md") so those links work when browsing the repo on
// GitHub. Starlight pages don't live at those URLs though (README.md is
// "/", architecture.md is "/architecture/", etc.), so this rewrites those
// links to the matching Starlight route at build time.
const slugFor = (filename) => (filename === 'README.md' ? '' : filename.replace(/\.md$/, ''));

export function remarkDocLinks() {
	return (tree, file) => {
		const currentFile = path.basename(file.history[0] ?? file.path ?? '');
		const currentSlug = slugFor(currentFile);

		visit(tree, 'link', (node) => {
			// Also matches an optional #fragment (e.g. "architecture.md#casting"),
			// carrying it over unchanged so anchor links to a specific section
			// still work after the path itself is rewritten.
			const match = node.url.match(/^([\w-]+\.md)(#[\w-]+)?$/);
			if (!match) return;

			const targetSlug = slugFor(match[1]);
			const fragment = match[2] ?? '';

			if (currentSlug === '') {
				node.url = (targetSlug === '' ? './' : `${targetSlug}/`) + fragment;
			} else {
				node.url = (targetSlug === '' ? '../' : `../${targetSlug}/`) + fragment;
			}
		});
	};
}
