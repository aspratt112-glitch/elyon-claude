// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// Keystatic uses local storage, so its admin UI only runs under `astro dev`.
// Leaving it out of builds keeps the site fully static (no adapter needed).
const isDev = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  integrations: [react(), ...(isDev ? [keystatic()] : [])]
});
