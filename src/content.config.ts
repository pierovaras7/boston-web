import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    category: z.enum(['académico', 'concurso', 'evento', 'educativo']),
    image: z.string().optional(),
    author: z.string().optional(),
    featured: z.boolean().optional().default(false),
    lang: z.enum(['es', 'en']).optional().default('es'),
  }),
});

export const collections = {
  articles,
};
