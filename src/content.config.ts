import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const pilotes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pilotes" }),
  schema: z.object({
    nom: z.string(),
    prenom: z.string(),
    numero: z.string(),
    categorie: z.string(),
    trophee: z.boolean().default(false),
    bio: z.string(),
    photo: z.string(),
    ordre: z.number(),
  }),
});

const partenaires = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/partenaires" }),
  schema: z.object({
    nom: z.string(),
    niveau: z.enum([
      "Partenaire Titre",
      "Partenaire Principal",
      "Partenaire Officiel",
      "Partenaire Technique",
      "Partenaire",
    ]),
    role: z.string(),
    description: z.string(),
    citation: z.string().optional(),
    site: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    email: z.string().optional(),
    telephone: z.string().optional(),
    logo: z.string().optional(),
    photo: z.string().optional(),
    /** Couleur de fond de la card (hex). Ex: "#0F172A". Défaut sombre si absent. */
    couleur: z.string().optional(),
    /** Couleur du logo (utile si fond clair) — laissé vide = pas de filtre */
    logoTint: z.enum(["white", "black"]).optional(),
    ordre: z.number(),
  }),
});

const equipe = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/equipe" }),
  schema: z.object({
    nom: z.string(),
    prenom: z.string(),
    role: z.string(),
    bio: z.string(),
    citation: z.string().optional(),
    photo: z.string().optional(),
    ordre: z.number(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.enum([
      "compte-rendu",
      "portrait",
      "coulisses",
      "partenaire",
      "ecurie",
    ]),
    cover: z.string(),
    pilotes: z.array(z.string()).optional(),
    course: z.string().optional(),
    position: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { pilotes, partenaires, equipe, articles };
