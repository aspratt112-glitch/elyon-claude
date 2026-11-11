import type { APIRoute } from 'astro';
import { cardPaths, vcard, type Card } from '../../lib/card';

// Served at /card/<name>/contact.vcf: the contact file behind each card's "Save contact" button.
export const getStaticPaths = cardPaths;

export const GET: APIRoute = ({ props }) => {
	return new Response(vcard((props as { card: Card }).card), {
		headers: { 'Content-Type': 'text/vcard; charset=utf-8' },
	});
};
