// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	integrations: [react()],
	vite: {
		environments: {
			astro: { optimizeDeps: { include: ['yaml', 'picomatch'] } },
			prerender: { optimizeDeps: { include: ['yaml', 'picomatch'] } },
		},
	},
});
