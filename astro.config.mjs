// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	integrations: [react()],
	prefetch: true,
	build: { inlineStylesheets: 'always' },
	fonts: [
		{ provider: fontProviders.google(), name: 'Montserrat', cssVariable: '--astro-font-heading', styles: ['normal'], weights: ['600 900'], subsets: ['latin'] },
		{ provider: fontProviders.google(), name: 'Inter', cssVariable: '--astro-font-body', styles: ['normal'], weights: ['300 700'], subsets: ['latin'] },
		{ provider: fontProviders.google(), name: 'Poppins', cssVariable: '--astro-font-accent', styles: ['normal'], weights: [300, 400, 500, 600, 700, 800, 900], subsets: ['latin'] },
	],
	vite: {
		environments: {
			astro: { optimizeDeps: { include: ['yaml', 'picomatch'] } },
			prerender: { optimizeDeps: { include: ['yaml', 'picomatch'] } },
		},
	},
});
