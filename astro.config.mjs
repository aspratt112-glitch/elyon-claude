// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';

// Keystatic uses local storage, so its admin UI only runs under `astro dev`.
// Leaving it out of builds keeps the site fully static (no adapter needed).
const isDev = process.argv.includes('dev');

// "Site is live" in Keystatic's Site settings. Until it's ticked, a build only
// contains the sign-up landing page; the full site stays in dev for editing.
const launched = /^launched:\s*true\s*$/m.test(readFileSync('./src/content/settings.yaml', 'utf8'));

const fullSite = [
	['/', 'index.astro'],
	['/story', 'story.astro'],
	['/mission', 'mission.astro'],
	['/faq', 'faq.astro'],
	['/contact', 'contact.astro'],
	['/products/[slug]', 'products/[slug].astro'],
];

/** Pages live in src/routes (not src/pages) so which ones get built can be switched. */
function routes() {
	return {
		name: 'elyon-routes',
		hooks: {
			/** @param {{ injectRoute: (route: { pattern: string; entrypoint: string }) => void }} options */
			'astro:config:setup': ({ injectRoute }) => {
				const add = (pattern, file) => injectRoute({ pattern, entrypoint: `./src/routes/${file}` });

				// Digital business cards are always published, before and after launch
				add('/card/[slug]', 'card/[slug].astro');
				add('/card/[slug]/contact.vcf', 'card/contact.ts');
				add('/card/[slug]/manifest.webmanifest', 'card/manifest.ts');

				if (launched || isDev) fullSite.forEach(([pattern, file]) => add(pattern, file));

				if (launched) return;
				if (isDev) {
					// Preview the landing page while editing it
					add('/coming-soon', 'coming-soon.astro');
				} else {
					add('/', 'coming-soon.astro');
					// Any other address (old links, typed URLs) shows the sign-up too
					add('/404', 'coming-soon.astro');
				}
			},
		},
	};
}

// https://astro.build/config
export default defineConfig({
	// Andrew's card lived at /card before there was one per person; QR codes already shared still point there.
	// Netlify does the same redirect with a proper 301 (netlify.toml); this one covers `astro dev`.
	redirects: {
		'/card': '/card/andrew/',
		'/card/contact.vcf': '/card/andrew/contact.vcf',
	},
	integrations: [react(), routes(), ...(isDev ? [keystatic()] : [])],
	vite: {
		plugins: [tailwindcss()],
	},
});
