# PRD.md — Site swsm-racing-team.fr

Product Requirements Document.
Document technique de référence pour la construction du site.
À lire en complément de STRATEGIE.md (qui pose le pourquoi).

---

## 1. Stack technique

### Framework
- **Astro** (dernière version stable)
- **TypeScript** strict mode
- **Tailwind CSS v4** (via `@tailwindcss/vite`)

> **Note (2026-05-01)** : choix de **Tailwind v4** plutôt que Tailwind v3 + `@astrojs/tailwind`. Tailwind v4 est la version installée par défaut par la CLI Astro actuelle et la stack recommandée. La configuration ne se fait plus via un fichier JS (`tailwind.config.mjs`) mais directement dans le CSS via la directive `@theme` dans `src/styles/global.css`. Tous les tokens de la charte SWSM (couleurs, polices, dégradé, letter-spacing) sont fidèlement reportés — aucun changement fonctionnel.

### Configuration de base à prévoir
- Intégration `@tailwindcss/vite` (Tailwind v4) — configuration via `@theme` dans `src/styles/global.css`
- Intégration `@astrojs/sitemap` (auto-génération du sitemap)
- Intégration `@astrojs/mdx` (pour articles riches)
- `astro.config.mjs` avec `site: 'https://swsm-racing-team.fr'`

### Polices
- **Space Grotesk** (titres) : 500, 700
- **Inter** (corps) : 400, 500
- Chargées via Google Fonts avec `display: swap` et preconnect
- Variables CSS : `--font-display: 'Space Grotesk'`, `--font-body: 'Inter'`

### Hébergement et déploiement
- Repo GitHub (à créer)
- Cloudflare Pages connecté au repo
- Auto-déploiement à chaque push sur la branche `main`
- Domaine custom : `swsm-racing-team.fr`

### Outils tiers
- **Plausible Analytics** : tracking, configuré avec le domaine et un event custom pour le téléchargement du dossier sponsoring
- **Formspree** : endpoints à créer pour formulaire Devenir partenaire et formulaire Contact

---

## 2. Structure de dossiers

```
swsm-racing-team/
├── src/
│   ├── pages/
│   │   ├── index.astro                  # Home long-scroll
│   │   ├── coulisses/
│   │   │   ├── index.astro              # Liste articles
│   │   │   └── [slug].astro             # Détail article
│   │   ├── partenaires.astro            # Page partenaires détaillée
│   │   └── devenir-partenaire.astro     # Page conversion sponsoring
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.astro
│   │   │   ├── Footer.astro
│   │   │   └── BaseHead.astro           # SEO, polices, meta
│   │   ├── home/
│   │   │   ├── HeroSection.astro
│   │   │   ├── ManifestoSection.astro
│   │   │   ├── PilotesSection.astro
│   │   │   ├── PartenairesSection.astro
│   │   │   ├── SaisonSection.astro
│   │   │   ├── CoulissesSection.astro
│   │   │   ├── CTASection.astro
│   │   │   └── FooterSection.astro
│   │   ├── partenaires/
│   │   │   └── PartenaireModal.astro
│   │   └── ui/
│   │       ├── Button.astro
│   │       ├── Eyebrow.astro
│   │       └── ScrollIndicator.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── content/
│   │   ├── config.ts                    # Schéma collections
│   │   ├── articles/                    # Comptes rendus en .md
│   │   │   └── *.md
│   │   ├── pilotes/                     # 3 fiches pilotes
│   │   │   ├── axel-lechartier.md
│   │   │   ├── tristan-ducap.md
│   │   │   └── edouardo-ferrera.md
│   │   └── partenaires/                 # 5 fiches partenaires
│   │       ├── 360-franchises.md
│   │       ├── atl-capital.md
│   │       ├── bearmotorshop.md
│   │       ├── alystar.md
│   │       └── team-33.md
│   ├── styles/
│   │   └── global.css                   # Variables CSS, base
│   └── data/
│       └── saison.json                  # Calendrier et résultats saison
├── public/
│   ├── images/
│   │   ├── hero/
│   │   ├── pilotes/
│   │   ├── partenaires/
│   │   └── articles/
│   ├── pdfs/
│   │   └── dossier-sponsoring.pdf
│   ├── favicon.svg
│   └── robots.txt
├── astro.config.mjs
├── (pas de tailwind.config.mjs — Tailwind v4 configuré dans src/styles/global.css)
├── tsconfig.json
└── package.json
```

---

## 3. Charte visuelle technique

### Variables Tailwind à configurer dans src/styles/global.css (Tailwind v4 — directive `@theme`)

```css
@import "tailwindcss";
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500&display=swap");

@theme {
  --color-swsm-black: #0D0D0D;
  --color-swsm-white: #F7F7F5;
  --color-swsm-pink: #EC2D7C;
  --color-swsm-violet: #5B21B6;

  --font-display: "Space Grotesk", sans-serif;
  --font-body: "Inter", sans-serif;

  --background-image-gradient-signature: linear-gradient(135deg, #EC2D7C 0%, #5B21B6 100%);

  --tracking-eyebrow: 0.15em;
  --tracking-caps-tight: -0.01em;
  --tracking-caps-loose: 0.05em;
}
```

### Classes utilitaires à privilégier
- Eyebrow : `text-xs uppercase tracking-eyebrow font-display font-medium text-swsm-pink`
- Titre H1 : `text-4xl md:text-6xl font-display font-bold leading-tight`
- Titre H2 : `text-2xl md:text-4xl font-display font-bold`
- Corps : `text-base font-body leading-relaxed`
- CTA : `font-display font-bold uppercase tracking-caps-loose text-sm`

### Règles globales d'usage
- Pas plus de 2 sections de couleur pleine par page
- Toujours une section neutre entre deux sections colorées
- Texte sur fond coloré : toujours blanc cassé `#F7F7F5`

---

## 4. Layout global

### Navbar (`/src/components/layout/Navbar.astro`)
- Position : `fixed top-0 left-0 right-0 z-50`
- Sur le hero : transparente (fond `bg-transparent`)
- Au scroll : fond solide `bg-swsm-black/95 backdrop-blur-md`
- **Hide-on-scroll** : disparaît au scroll vers le bas, réapparaît au scroll vers le haut
  - Implémentation : Intersection Observer ou listener scroll avec debounce
  - Animation : `transform translate-y-0 / -translate-y-full` avec `transition-transform duration-300`
- Contenu :
  - Gauche : logo SWSM (cliquable, retour `/`)
  - Centre/Droite : 3 liens — Coulisses · Partenaires · Devenir partenaire
  - Mobile : menu hamburger avec drawer plein écran

### Footer (`/src/components/layout/Footer.astro`)
- Section sombre `bg-swsm-black text-swsm-white`
- 4 colonnes desktop, empilé mobile :
  1. Logo + baseline + réseaux sociaux (Instagram, LinkedIn, Facebook, TikTok, YouTube)
  2. Navigation (Coulisses, Partenaires, Devenir partenaire)
  3. Partenaires (5 logos en bande, version mini, monochrome blanc)
  4. Contact (email contact@swsm-racing-team.fr, lien vers formulaire)
- Bas : copyright année dynamique + mentions légales + politique de confidentialité

### BaseHead (`/src/components/layout/BaseHead.astro`)
- Title dynamique : `{title} — SWSM Racing Team`
- Meta description (par page)
- Open Graph : title, description, image, url
- Twitter Card
- Favicon
- Polices Google Fonts (Space Grotesk + Inter) avec preconnect
- Script Plausible
- Canonical URL

---

## 5. Page Home — Détail des 8 sections

### Section A — Hero
- **Hauteur** : `100vh` (100 % viewport)
- **Fond** : slideshow de 3 photos (transition fade, durée 4s par photo)
- **Overlay** : `bg-black/50` pour lisibilité du texte
- **Contenu centré verticalement** :
  - Eyebrow : `SWSM RACING TEAM` (rose, CAPS, letter-spacing élargi)
  - Titre principal : *UNE ÉCURIE. UNE AMBITION.* (CAPS, blanc, Space Grotesk Bold, taille `text-5xl md:text-7xl`)
  - Sous-texte : *Trois pilotes. Une écurie. Une saison.* (blanc cassé, Inter, taille `text-base md:text-lg`)
- **Pas de CTA dans le hero**
- **Indicateur de scroll** : flèche animée discrète en bas, ou texte `SCROLL` en CAPS

### Section B — Manifeste
- **Hauteur** : `min-h-[70vh]` (pas obligé d'être 100vh)
- **Fond** : dégradé signature `bg-gradient-signature`
- **Contenu centré** :
  - Eyebrow : `NOTRE ENGAGEMENT` (blanc opacité 85 %)
  - Phrase manifeste : *Investir dans une structure.* / *Pas seulement sponsoriser un pilote.* (Space Grotesk Bold, blanc, sentence case, taille `text-3xl md:text-5xl`)
  - Deuxième ligne en taille légèrement réduite pour hiérarchie
- **Animation** : fade-in du texte au scroll (Intersection Observer)
- **Aucun CTA, aucune photo**

### Section C — Pilotes
- **Hauteur** : `100vh`
- **Format** : un seul pilote affiché à la fois, navigation manuelle entre les 3
- **Mise en page** :
  - Côté gauche (60 % desktop) : grande photo verticale du pilote, animation de flottement permanente (translation Y de 8-10px sur 4-5 secondes en boucle, easing sinusoïdal)
  - Côté droit (40 % desktop) : zone bio
    - Eyebrow : `PILOTE 01` (ou 02, 03)
    - Numéro de course en très gros (ex `#52`), Space Grotesk Bold, taille `text-8xl md:text-9xl`, peut être en outline ou opacity réduite
    - Prénom + Nom (Space Grotesk Bold, taille `text-3xl`)
    - Catégorie : *Challenger — Trophée de France*
    - Bio courte (3-4 lignes max, Inter Regular)
- **Bouton de navigation** : grand cercle flottant
  - Position : bas droit ou centré bas
  - Diamètre : 80-100px
  - Bordure dégradé rose-violet en rotation continue (animation conic-gradient sur axe Z, cycle 6-8s)
  - Intérieur : fond noir profond ou transparent backdrop-blur
  - Centre : compteur `01 / 03` qui change à chaque transition
  - Hover : scale 1.05, rotation accélérée
  - Click : transition pilote suivant, loop infini
- **Transition entre pilotes** :
  - Photo actuelle sort vers la gauche en fade
  - Photo suivante arrive de la droite en fade
  - Bio change avec délai 50-100ms (effet cascade)
  - Optionnel : numéro de course très gros qui passe en arrière-plan pendant transition
- **Mobile** : empilé verticalement, navigation par swipe + bouton

### Section D — Partenaires
- **Hauteur** : `100vh` ou `min-h-[80vh]`
- **Fond** : `bg-swsm-black`
- **Contenu** :
  - Eyebrow : `ILS NOUS ACCOMPAGNENT` (rose)
  - Titre : *Cinq partenaires. Une seule équipe.* (blanc, sentence case)
  - Sous-titre : *Des entreprises qui investissent dans une structure sportive en construction.* (blanc opacité 70 %)
- **Grille des 5 logos** :
  - Logos en monochrome blanc (filter CSS si nécessaire)
  - Apparition séquentielle au scroll (Intersection Observer + délai 100-150ms entre chaque)
  - Disposition : grille 3 + 2 (3 en haut, 2 en bas centrés) sur desktop ; 2 colonnes sur mobile
  - Hover : logo passe en couleur + apparition d'une ligne courte (rôle du partenaire)
  - Click : ouvre modale détaillée
- **CTA bas de section** : bouton centré rose plein `DEVENIR PARTENAIRE →` (lien vers `/devenir-partenaire`)

### Section E — Saison
- **Hauteur** : auto, padding `py-20 md:py-32`
- **Fond** : `bg-swsm-white`
- **2 blocs côte à côte (desktop), empilés (mobile)** :

**Bloc gauche — Dernière course**
- Eyebrow : `DERNIÈRE COURSE`
- Lieu + date (CAPS) : `VAL D'ARGENTON — 15 OCT 2026`
- Position en très gros : `P12` (Space Grotesk Bold, taille `text-7xl`)
- Pilote concerné (mention courte)
- Titre court du compte rendu
- Bouton : `LIRE LE COMPTE RENDU →` (lien vers article)

**Bloc droit — Calendrier saison**
- Eyebrow : `SAISON 2026`
- Liste des 6-8 manches
- Course passée : style barré + position des 3 pilotes en mini
- Course à venir : date + lieu mis en avant
- Course en cours : badge animé `EN DIRECT`

### Section F — Coulisses
- **Hauteur** : auto
- **Fond** : `bg-swsm-white` (alternance possible avec section sombre, à arbitrer)
- **Contenu** :
  - Eyebrow : `LES COULISSES`
  - Titre : *L'écurie au quotidien.*
  - Sous-titre : *Comptes rendus de course, portraits, préparation, paddock.*
- **Grille horizontale** : 3 derniers articles publiés
  - Photo grande (16:9 ou 4:3)
  - Catégorie en CAPS
  - Titre article
  - Date
  - Hover : léger scale + ombre
  - Click : navigation vers `/coulisses/[slug]`
- **CTA bas** : `VOIR TOUS LES ARTICLES →` (lien vers `/coulisses`)

### Section G — Devenir partenaire (CTA)
- **Hauteur** : `min-h-[60vh]`
- **Fond** : à arbitrer (rose plein, violet plein, ou dégradé)
- **Contenu centré** :
  - Eyebrow : `INVESTIR DANS L'ÉCURIE`
  - Titre : *Faites partie de l'écurie.* (Space Grotesk Bold, blanc)
  - Sous-texte : *Cinq partenaires nous accompagnent déjà. Découvrez comment associer votre marque à SWSM Racing Team.*
  - 2 boutons :
    - Principal : `TÉLÉCHARGER LE DOSSIER →` (déclenche download PDF + event Plausible)
    - Secondaire : `PRENDRE CONTACT →` (lien vers `/devenir-partenaire`)

### Section H — Footer
Voir section Layout global ci-dessus.

---

## 6. Page Coulisses (à détailler en sprint dédié)

### `/coulisses/index.astro`
- Liste paginée des articles
- Filtres par catégorie (Compte rendu / Portrait / Coulisses techniques / Partenaire / Vie d'écurie)
- Mise en page magazine : grande photo + extrait court

### `/coulisses/[slug].astro`
- Layout article : titre, date, catégorie, photo de couverture
- Contenu Markdown rendu
- Galerie photos intégrée
- Section "Articles liés" en bas
- Boutons partage social

### Schéma collection `articles`
```typescript
{
  title: string,
  description: string,
  pubDate: Date,
  category: 'compte-rendu' | 'portrait' | 'coulisses' | 'partenaire' | 'ecurie',
  cover: string,
  pilotes?: string[],   // référence aux pilotes concernés
  course?: string,      // pour comptes rendus
  position?: string,    // résultat
  draft: boolean
}
```

---

## 7. Page Partenaires (à détailler en sprint dédié)

### `/partenaires.astro`
- Hero court : titre + intro
- Pour chaque partenaire (5 blocs) :
  - Logo grand format
  - Photo en lien avec SWSM (atelier, équipe, partenaire en paddock)
  - Texte de description
  - Citation / témoignage (à recueillir auprès de chaque partenaire)
  - Lien vers leur site
- Section CTA bas : `DEVENIR PARTENAIRE →`

### Modale partenaire (composant)
- Ouverture en fade + scale léger depuis la section D de la home
- Contenu :
  - Logo couleur
  - Nom + niveau partenariat
  - 1-2 photos
  - Description (4-6 lignes)
  - Citation/témoignage si dispo
  - Bloc contact : site web, LinkedIn, Instagram, téléphone, email
  - Croix de fermeture
- Fermeture : clic extérieur, touche Échap, croix

---

## 8. Page Devenir partenaire (à détailler en sprint dédié)

Structure landing page de vente :
- Hero : promesse en CAPS forte
- 3 arguments visuels (pourquoi SWSM)
- Audience et chiffres (KPI à mesure que le site génère des données)
- 5 niveaux de partenariat en grille premium (sans tarifs)
- Témoignages des 5 partenaires actuels
- Formulaire qualifié :
  - Nom
  - Entreprise
  - Email pro
  - Téléphone
  - Niveau de partenariat envisagé (radio)
  - Budget envisagé (range)
  - Message libre
  - Envoi via Formspree
- Bouton `TÉLÉCHARGER LE DOSSIER SPONSORING PDF`
- Calendrier de prise de RDV (Calendly intégré ou simple email de relance)

---

## 9. Conventions de code

### Astro
- Composants `.astro` en PascalCase : `HeroSection.astro`
- Pages en kebab-case dans les URLs : `/devenir-partenaire`
- Props typées avec TypeScript
- Pas de logique métier dans les pages, déléguer aux composants

### Tailwind
- Privilégier les classes utilitaires Tailwind
- Pas de CSS custom sauf pour animations complexes (keyframes, conic-gradient en rotation)
- Si CSS custom : dans `<style>` scopé du composant Astro

### Accessibilité
- Tous les boutons et liens : focus visible
- Images : alt text descriptif systématique
- Hiérarchie des titres respectée (un seul H1 par page)
- Navigation au clavier fonctionnelle
- Contraste minimum WCAG AA respecté

### Performance
- Images optimisées en WebP avec fallback
- `loading="lazy"` sur les images sous le fold
- Composant `<Image>` d'Astro privilégié (optimisation auto)
- Polices : `display: swap`, preconnect Google Fonts
- Pas de JS inutile (Astro est statique par défaut)

---

## 10. Workflow développement

### Local-first
1. `npm run dev` lance le site sur `http://localhost:4321`
2. Itération visuelle en local, validation à l'œil
3. Test mobile via DevTools (responsive)
4. Commit + push vers GitHub uniquement quand validé
5. Cloudflare Pages déploie automatiquement (1-2 min)

### Conventions Git
- Branche principale : `main`
- Branches feature : `feat/section-hero`, `feat/page-partenaires`
- Commits en français : `Ajout section A Hero`, `Correction navbar mobile`
- Pas de push direct sur main pendant les sprints (préférer pull requests même en solo, pour traçabilité)

### Tests à effectuer avant chaque mise en ligne
- Test responsive : 375px (mobile), 768px (tablette), 1280px (desktop), 1920px (large)
- Test navigation clavier (Tab + Enter)
- Test Lighthouse : score Performance > 90, Accessibility > 95, SEO > 95
- Test formulaires : envoi réel sur Formspree
- Test tracking : event Plausible bien déclenché
- Test liens externes : ouverture en nouvel onglet (`target="_blank" rel="noopener noreferrer"`)

---

## 11. Production de matière (à anticiper)

### Photos requises pour le J1
- 3 photos hero (slideshow) : action piste OU paddock OU portraits collectifs
- 3 photos pilotes (un par pilote) : actuellement déséquilibré (Tristan + Axel en combi sur fond, Edouardo en action). Solution court terme : traitement noir et blanc + overlay rose-violet pour homogénéiser. Solution moyen terme : shooting collectif harmonisé.
- 5 logos partenaires en SVG (versions couleur ET monochrome blanc)
- 5 photos partenaires (atelier, équipe, locaux)
- 1 photo coulisses pour la section F

### Contenus textuels requis pour le J1
- 3 bios pilotes (3-4 lignes chacune, factuelles, sportives)
- 5 descriptions partenaires (4-6 lignes chacune)
- 5 citations/témoignages partenaires (à recueillir)
- 2-3 premiers articles `/coulisses` pour ne pas avoir une page vide
- Dossier sponsoring PDF (à produire en parallèle du site)

### Email pro
- Création boîte `contact@swsm-racing-team.fr` (via hébergement domaine ou service externe)

---

## 12. Évolutions futures (hors scope J1)

À ne pas développer maintenant, mais à anticiper architecturalement :
- Newsletter sponsors (capture email + envoi récurrent)
- Espace sponsor privé (login, accès dossiers réservés, photos exclusives)
- Galerie photos / vidéos dédiée
- Calendrier interactif des courses
- Live results pendant les courses
- Système multilingue (FR + EN pour cibler marques nationales)
- E-commerce léger (merchandising écurie : t-shirts, casquettes)
