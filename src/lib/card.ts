import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { reader } from './content';

/** The live site. QR codes always point here, even when the card is previewed locally. */
export const SITE = 'https://elyonlabs.com.au';

/** Everyone's digital business card, edited in Keystatic under "Digital business cards". */
export async function getCards() {
	const entries = await reader.collections.cards.all();
	return entries.map(({ slug, entry }) => ({
		...entry,
		slug,
		site: SITE,
		firstName: entry.name.trim().split(/\s+/)[0],
		/** This person's card on the live site: what their QR code opens. */
		cardUrl: `${SITE}/card/${slug}/`,
		/** International format for the phone link and the saved contact, e.g. +61400000000. */
		phoneE164: toE164(entry.phone),
		instagramUrl: entry.instagram ? `https://www.instagram.com/${entry.instagram.replace(/^@/, '')}` : '',
	}));
}

export type Card = Awaited<ReturnType<typeof getCards>>[number];

/** One page per card: shared by the card page, its contact file and its home-screen manifest. */
export async function cardPaths() {
	const cards = await getCards();
	return cards.map((card) => ({ params: { slug: card.slug }, props: { card } }));
}

function toE164(phone: string) {
	const digits = phone.replace(/[^\d+]/g, '');
	// Australian numbers typed locally (04xx…, 02…) become +61…
	if (/^0\d{9}$/.test(digits)) return `+61${digits.slice(1)}`;
	return digits;
}

/** vCard text values escape backslashes, commas, semicolons and newlines. */
const esc = (value: string) => value.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\r?\n/g, '\\n');

/** vCard lines are folded at 75 characters, continuing with a leading space. */
function fold(line: string) {
	const parts = [];
	for (let i = 0; i < line.length; i += i === 0 ? 75 : 74) parts.push(line.slice(i, i + (i === 0 ? 75 : 74)));
	return parts.join('\r\n ');
}

/** Builds the contact file that "Save contact" downloads (vCard 3.0: read by iPhone, Android and Outlook). */
export function vcard(card: Card) {
	const [first, ...rest] = card.name.trim().split(/\s+/);
	const last = rest.join(' ');
	const photo = readFileSync(join(process.cwd(), 'src/assets/card-photo.jpg')).toString('base64');

	const lines = [
		'BEGIN:VCARD',
		'VERSION:3.0',
		`N:${esc(last)};${esc(first)};;;`,
		`FN:${esc(card.name)}`,
		'ORG:Elyon Labs',
		card.title && `TITLE:${esc(card.title)}`,
		card.phoneE164 && `TEL;TYPE=CELL,VOICE:${card.phoneE164}`,
		card.email && `EMAIL;TYPE=INTERNET,WORK:${card.email}`,
		`URL:${card.site}`,
		card.instagramUrl && `X-SOCIALPROFILE;TYPE=instagram:${card.instagramUrl}`,
		`NOTE:${esc("Premium men's haircare. Made in Australia.")}`,
		`PHOTO;ENCODING=b;TYPE=JPEG:${photo}`,
		'END:VCARD',
	].filter(Boolean) as string[];

	return lines.map(fold).join('\r\n') + '\r\n';
}
