import type { APIRoute } from 'astro';
import { getCard, vcard } from '../lib/card';

// Served at /card/contact.vcf: the contact file behind the card's "Save contact" button.
export const GET: APIRoute = async ({ url }) => {
	const card = await getCard(url.origin);
	return new Response(vcard(card), {
		headers: { 'Content-Type': 'text/vcard; charset=utf-8' },
	});
};
