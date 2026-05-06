# SESSION 1 — Claude Code

Première session de développement du site swsm-racing-team.fr.
Document à suivre étape par étape.
Objectif : voir la **Section A Hero** rendue en local sur `http://localhost:4321`.
Pas de mise en ligne dans cette session.

---

## Avant de commencer

### Prérequis à valider avant la session
- [ ] Compte GitHub créé (gratuit, 5 minutes)
- [ ] Claude Code Desktop installé et fonctionnel
- [ ] Node.js installé sur ton ordinateur (version 18 ou supérieure)
  - Vérification : ouvrir un terminal et taper `node --version`
  - Si pas installé : https://nodejs.org (LTS recommandé)
- [ ] Les 3 photos hero placées dans un dossier accessible (ou des photos provisoires)
- [ ] Les 2 fichiers `STRATEGIE.md` et `PRD.md` à portée de main

### Ce qu'on va faire dans cette session
1. Créer le dossier projet local
2. Initialiser le projet Astro avec Claude Code
3. Configurer Tailwind avec la palette SWSM
4. Créer le layout de base (BaseLayout, Navbar minimale, Footer minimal)
5. Créer la Section A Hero
6. Lancer le site en local et visualiser
7. Itérer sur le rendu jusqu'à validation

### Ce qu'on ne fera PAS dans cette session
- Pas de push GitHub
- Pas de déploiement Cloudflare
- Pas de Sections B, C, D, etc.
- Pas de page autre que la home

---

## Étape 1 — Préparer l'environnement

### 1.1 — Créer le dossier projet

Sur ton ordinateur, crée un dossier vide pour le projet, par exemple :
- macOS / Linux : `~/Documents/Projets/swsm-racing-team`
- Windows : `C:\Users\Axel\Documents\Projets\swsm-racing-team`

### 1.2 — Ouvrir Claude Code Desktop dans ce dossier

Ouvre Claude Code Desktop, puis ouvre le dossier que tu viens de créer (File → Open Folder).

### 1.3 — Placer les fichiers de référence

Copie les fichiers `STRATEGIE.md` et `PRD.md` à la racine du dossier projet.
Claude Code pourra les lire à la demande.

---

## Étape 2 — Initialisation du projet Astro

### Prompt 1 — Création du projet

Copier-coller dans Claude Code Desktop :

```
Tu vas initialiser un nouveau projet Astro pour le site swsm-racing-team.fr.

Lis d'abord le fichier PRD.md à la racine du projet pour comprendre le contexte technique complet.

Ensuite :

1. Initialise un nouveau projet Astro avec la commande "npm create astro@latest . -- --template minimal --typescript strict --install --no-git --skip-houston". Le projet doit s'installer dans le dossier courant (.) et non dans un sous-dossier.

2. Une fois Astro installé, ajoute les intégrations suivantes :
   - @astrojs/tailwind
   - @astrojs/sitemap
   - @astrojs/mdx

3. Configure tailwind.config.mjs avec la charte visuelle SWSM Racing Team :
   - Couleurs custom : swsm-black (#0D0D0D), swsm-white (#F7F7F5), swsm-pink (#EC2D7C), swsm-violet (#5B21B6)
   - Polices : Space Grotesk pour "display", Inter pour "body"
   - Background image : gradient-signature en linear-gradient(135deg, #EC2D7C 0%, #5B21B6 100%)
   - Letter-spacing : eyebrow (0.15em), caps-tight (-0.01em), caps-loose (0.05em)

4. Configure astro.config.mjs avec :
   - site: 'https://swsm-racing-team.fr'
   - output: 'static'
   - intégrations Tailwind, sitemap et mdx activées

5. Crée la structure de dossiers prévue dans le PRD :
   - src/components/layout/
   - src/components/home/
   - src/components/ui/
   - src/layouts/
   - src/styles/
   - public/images/hero/
   - public/images/pilotes/
   - public/images/partenaires/

6. Crée le fichier src/styles/global.css qui :
   - Importe les directives Tailwind (@tailwind base; @tailwind components; @tailwind utilities;)
   - Charge les polices Space Grotesk (500, 700) et Inter (400, 500) depuis Google Fonts via @import url()
   - Définit les variables CSS de base si nécessaire

7. NE crée PAS encore de pages, layouts ou composants. On le fera dans le prompt suivant.

8. Affiche-moi à la fin la structure des dossiers et le contenu des fichiers de configuration pour validation.

Procède étape par étape et indique-moi clairement ce que tu fais.
```

### Ce que tu dois vérifier après le prompt 1
- Le projet Astro est créé dans le dossier
- Le fichier `tailwind.config.mjs` contient bien la palette SWSM
- La structure de dossiers est correcte
- Aucune erreur dans le terminal

### Si quelque chose cloche
Demande à Claude Code : *"Affiche-moi le contenu du fichier [X] pour que je vérifie."* puis demande la correction si besoin.

---

## Étape 3 — Layout de base

### Prompt 2 — BaseLayout, Navbar minimale, Footer minimal

```
Maintenant, crée le layout de base du site. Réfère-toi au PRD.md section 4 (Layout global) pour les spécifications.

1. Crée src/components/layout/BaseHead.astro qui contient :
   - Charset UTF-8
   - Meta viewport
   - Title dynamique au format : `${title} — SWSM Racing Team`
   - Meta description (passée en props)
   - Open Graph basique (title, description, image, url, type=website)
   - Twitter Card summary_large_image
   - Favicon (référence à /favicon.svg, on créera le fichier plus tard)
   - Préchargement Google Fonts (Space Grotesk + Inter) avec preconnect
   - Import du fichier global.css
   - Canonical URL

2. Crée src/components/layout/Navbar.astro :
   - Position fixed top-0 left-0 right-0 z-50
   - Sur la home, fond initialement transparent
   - Logo SWSM à gauche (texte "SWSM" en Space Grotesk Bold pour l'instant, on remplacera par le vrai logo plus tard)
   - 3 liens centrés ou à droite : "Coulisses", "Partenaires", "Devenir partenaire"
   - Comportement hide-on-scroll : la navbar disparaît au scroll vers le bas et réapparaît au scroll vers le haut. Implémente avec un script client (useEffect ou listener scroll avec debounce, en JS vanilla).
   - Mobile : menu hamburger avec drawer plein écran
   - Texte navbar en blanc cassé (visible sur fond sombre du hero)

3. Crée src/components/layout/Footer.astro version minimale pour cette session :
   - Section bg-swsm-black text-swsm-white
   - Padding py-16
   - Logo SWSM + ligne "© 2026 SWSM Racing Team — Tous droits réservés"
   - On enrichira le footer dans une session suivante

4. Crée src/layouts/BaseLayout.astro qui :
   - Reçoit les props title et description
   - Inclut BaseHead, Navbar, <slot />, Footer
   - HTML lang="fr"
   - body avec classes font-body bg-swsm-white text-swsm-black

5. Affiche-moi le contenu de chaque fichier créé pour validation.

Pas de page créée à ce stade. Pas de Section Hero. Juste le layout vide.
```

### Ce que tu dois vérifier après le prompt 2
- Les 4 fichiers existent
- La navbar a bien le comportement hide-on-scroll dans le code
- Le BaseLayout intègre correctement les éléments

---

## Étape 4 — Section A Hero

### Prompt 3 — Création de la Section A Hero

```
On crée maintenant la Section A Hero de la home. Réfère-toi au PRD.md section 5 "Section A — Hero" pour les spécifications exactes.

1. Crée src/components/home/HeroSection.astro avec :
   - Section pleine hauteur (min-h-screen)
   - Position relative
   - Slideshow de 3 images en arrière-plan :
     * Pour cette session, utilise des placeholders : 3 div avec background-color différents (par exemple swsm-black, swsm-violet, gradient signature) si je n'ai pas encore les vraies photos.
     * Si je te fournis 3 photos plus tard, on les remplacera. Crée la structure pour qu'elle soit prête à recevoir les vraies photos dans /public/images/hero/hero-1.jpg, hero-2.jpg, hero-3.jpg.
     * Transition fade entre les 3 photos, durée 4s par photo, boucle infinie. Implémentation en CSS pur (animation keyframes) ou JS léger.
   - Overlay sombre par-dessus les photos : bg-black/50 ou similaire pour lisibilité du texte
   - Contenu centré verticalement et horizontalement :
     * Eyebrow : "SWSM RACING TEAM" en classes : text-xs uppercase tracking-eyebrow font-display font-medium text-swsm-pink mb-4
     * Titre principal : "UNE ÉCURIE. UNE AMBITION." en classes : text-5xl md:text-7xl font-display font-bold text-swsm-white tracking-caps-tight uppercase mb-6
     * Sous-texte : "Trois pilotes. Une écurie. Une saison." en classes : text-base md:text-lg font-body text-swsm-white/80
   - Indicateur de scroll en bas centré : flèche animée discrète OU texte "SCROLL" en CAPS petit avec animation bounce subtile

2. Crée src/pages/index.astro qui :
   - Importe BaseLayout
   - Importe HeroSection
   - Passe title="Accueil" et description="Écurie privée du Sud-Ouest. Trois pilotes engagés en Championnat de France de Supermotard."
   - Affiche uniquement HeroSection pour l'instant

3. Affiche-moi le contenu des fichiers pour validation.

4. Donne-moi ensuite la commande exacte à lancer pour démarrer le serveur de développement local.
```

### Ce que tu dois vérifier après le prompt 3
- La Section Hero existe et est bien typée
- La page index.astro est créée
- Claude Code te donne la commande pour lancer le serveur

---

## Étape 5 — Lancer le site en local

### 5.1 — Démarrer le serveur

Dans le terminal de Claude Code Desktop, lance :

```bash
npm run dev
```

Le terminal devrait afficher :

```
astro v4.x.x ready in XXX ms
Local: http://localhost:4321/
```

### 5.2 — Ouvrir dans le navigateur

Ouvre Chrome ou Safari et va à `http://localhost:4321`

Tu dois voir :
- Le hero avec eyebrow rose, titre blanc CAPS, sous-texte
- Le slideshow d'arrière-plan qui défile (couleurs unies si tu n'as pas encore les photos)
- La navbar transparente posée sur le hero

### 5.3 — Tester la responsive

Dans Chrome : clic droit → Inspecter → icône responsive (en haut à gauche du panneau DevTools) → tester en 375px (iPhone) et 1280px (laptop).

---

## Étape 6 — Itération visuelle

À ce stade, tu vas probablement vouloir ajuster des choses. **N'écris pas du code toi-même.** Décris ce que tu veux changer à Claude Code.

### Exemples de prompts d'itération

**Si le titre est trop gros :**
> *Le titre principal "UNE ÉCURIE. UNE AMBITION." est trop gros sur desktop. Réduis-le d'un cran (text-6xl au lieu de text-7xl).*

**Si tu veux ajuster l'overlay :**
> *L'overlay sombre est trop opaque, on ne voit plus assez les photos en arrière-plan. Réduis l'opacité à 35 % au lieu de 50 %.*

**Si tu veux une animation différente :**
> *Le sous-texte "Trois pilotes..." apparaît brutalement. Ajoute un fade-in de 800ms avec un délai de 300ms après le titre.*

**Si tu veux ajouter les vraies photos :**
> *Voici 3 photos pour le slideshow hero. Place-les dans /public/images/hero/ avec les noms hero-1.jpg, hero-2.jpg, hero-3.jpg. Mets à jour HeroSection.astro pour les utiliser à la place des placeholders.*

### Discipline d'itération

- **Une demande à la fois.** Pas de "change le titre, l'overlay, l'animation et la couleur du sous-texte d'un coup."
- **Vérifie après chaque modification** que le rendu te plaît avant de demander la suivante.
- **Commits propres** : à la fin de la session, demande à Claude Code de faire un premier commit Git en local (sans push GitHub) avec le message "Initialisation projet + Section A Hero".

---

## Étape 7 — Fin de session

### Avant de fermer Claude Code Desktop

Demande à Claude Code :

```
Fais un récapitulatif de ce qui a été fait dans cette session. Liste :
- Les fichiers créés
- Les dépendances installées
- Ce qui fonctionne en local
- Ce qui reste à faire

Ensuite, initialise un repo Git local avec git init, fais un .gitignore standard pour Astro/Node, et fais un premier commit avec le message "Sprint 1 : Initialisation projet + Section A Hero - validation locale".

Ne pousse rien sur GitHub. On le fera quand on aura tout validé.
```

### Checklist de fin de session 1
- [ ] Le site tourne en local sur `localhost:4321`
- [ ] La Section A Hero est rendue et te plaît visuellement (au moins en V1)
- [ ] Tu as testé en mobile via DevTools, c'est lisible
- [ ] Le repo Git local est initialisé avec un premier commit
- [ ] Tu sais comment relancer `npm run dev` la prochaine fois

---

## Préparation pour la Session 2

Avant de lancer la session suivante, prépare :
- 3 photos pour le hero (si tu ne les avais pas encore)
- Les 5 logos des partenaires en SVG (version monochrome blanc et version couleur)
- Les 3 photos pilotes traitées (noir et blanc + overlay rose pour homogénéiser)

Sessions à venir :
- **Session 2** : Section B Manifeste + Section C Pilotes (carrousel)
- **Session 3** : Section D Partenaires (avec modales) + Section E Saison
- **Session 4** : Section F Coulisses + Section G CTA + Section H Footer enrichi
- **Session 5** : Première mise en ligne sur Cloudflare Pages

---

## Anti-patterns à éviter

### À ne pas faire en Session 1
- Demander à Claude Code de coder plusieurs sections d'un coup
- Demander à Claude Code de pusher sur GitHub
- Coder toi-même par-dessus ce que Claude Code a généré (tu vas créer des conflits)
- Itérer 30 fois sur des micro-détails de couleur (à un moment, ça suffit, on passe à la suite)

### À faire systématiquement
- Lire ce que Claude Code te génère (au moins le diff) avant de valider
- Tester en mobile et desktop après chaque modification
- Garder un œil sur le terminal pour repérer les erreurs / warnings
- Demander des explications à Claude Code si tu ne comprends pas un fichier généré
