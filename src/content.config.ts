import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Posts are written in Keystatic (/keystatic) and saved here as Markdoc files.
const posts = defineCollection({
	loader: glob({ pattern: '**/*.mdoc', base: './src/content/posts' }),
	schema: z.object({
		title: z.string(),
	}),
});

export const collections = { posts };
