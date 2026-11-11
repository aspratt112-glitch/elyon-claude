import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { reader } from './content';

/** The digital business card's details, edited in Keystatic under "Digital business card". */
export async function getCard(origin: string) {
	const card = await reader.singletons.card.readOrThrow();
	const site = (card.siteUrl || origin).replace(/\/+$/, '');
	return {
		...card,
		site,
		/** The address the QR code opens: this card, on the live site. */
		cardUrl: `${site}/card`,
		/** International format for the phone link and the saved contact, e.g. +61400000000. */
		phoneE164: toE164(card.phone),
		instagramUrl: card.instagram ? `https://www.instagram.com/${card.instagram.replace(/^@/, '')}` : '',
	};
}

export type Card = Awaited<ReturnType<typeof getCard>>;

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
