import type { APIRoute } from 'astro';
import { cardPaths, type Card } from '../../lib/card';

// Served at /card/<name>/manifest.webmanifest, so "Add to Home Screen" on an Android phone
// opens that person's own card.
export const getStaticPaths = cardPaths;

export const GET: APIRoute = ({ props }) => {
	const { card } = props as { card: Card };
	const manifest = {
		name: `${card.name} · Elyon`,
		short_name: `${card.firstName} · Elyon`,
		start_url: `/card/${card.slug}/`,
		scope: `/card/${card.slug}/`,
		display: 'standalone',
		background_color: '#eae1db',
		theme_color: '#eae1db',
		icons: [
			{ src: '/card/icon-192.png', sizes: '192x192', type: 'image/png' },
			{ src: '/card/icon-512.png', sizes: '512x512', type: 'image/png' },
		],
	};
	return new Response(JSON.stringify(manifest, null, '\t'), {
		headers: { 'Content-Type': 'application/manifest+json' },
	});
};
