import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '../../keystatic.config';

// Reads the content files Keystatic edits (src/content/**) at build time.
export const reader = createReader(process.cwd(), keystaticConfig);

export async function getSettings() {
	const settings = await reader.singletons.settings.readOrThrow();
	return settings;
}

export async function getProducts() {
	const entries = await reader.collections.products.all();
	return entries
		.map(({ slug, entry }) => ({ slug, ...entry }))
		.sort((a, b) => (a.step ?? 99) - (b.step ?? 99));
}

export type Product = Awaited<ReturnType<typeof getProducts>>[number];

/** Splits multiline text into paragraphs on blank lines. */
export function paragraphs(text: string | null | undefined) {
	return (text ?? '')
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean);
}

/** Formats a step number as the brand's bracketed index, e.g. "01". */
export function stepNumber(step: number | null | undefined) {
	return String(step ?? 0).padStart(2, '0');
}
