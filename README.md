# Cabinet Kiné Santé — Site de cabinet de kinésithérapie

Site vitrine + système de prise de rendez-vous en ligne + panneau d'administration complet, prêt pour la production.

## Stack technique

| Couche | Technologie |
| --- | --- |
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS, composants style shadcn/ui, Framer Motion, lucide-react |
| Base de données | PostgreSQL + Prisma ORM |
| Authentification | NextAuth (credentials, JWT, vérification email) |
| Formulaires | React Hook Form + Zod |
| Emails | Resend |
| WhatsApp | Meta WhatsApp Cloud API |
| Médias | Cloudinary |
| Déploiement | Docker / docker-compose (Next.js standalone) |

## Fonctionnalités

### Site public
- Page d'accueil : hero, soins, présentation de la praticienne, avantages, témoignages, FAQ, CTA
- Pages détaillées pour 8 soins (kinésithérapie, rééducation sportive, mal de dos, cervicalgies, post-opératoire, thérapie manuelle, dry needling, domicile)
- Page À propos (parcours, certifications, galerie)
- Page Contact (formulaire, Google Maps, téléphone, email, bouton WhatsApp flottant)
- SEO : metadata, sitemap.xml, robots.txt — responsive mobile-first, animations Framer Motion

### Espace patient
- Inscription avec vérification d'email, connexion, mot de passe oublié
- Réservation en 4 étapes : soin → date → créneau disponible → confirmation
- Notifications email + WhatsApp à chaque étape (demande, confirmation, refus, annulation, report, rappel)
- Consultation, annulation et report des rendez-vous

### Panneau d'administration (`/admin`)
- **Tableau de bord** : patients, RDV à venir, RDV du mois, nouveaux inscrits, revenus (graphique 6 mois)
- **Rendez-vous** : approbation, refus, report, terminé, annulé — filtres par statut
- **Agenda** : horaires hebdomadaires par plage, durée des créneaux, pause entre RDV, dates bloquées/congés
- **Patients** : recherche, fiche détaillée, historique, notes médicales, export CSV
- **Soins** : CRUD complet avec upload d'images
- **Contenu** : sections éditables (hero, à propos, praticienne), témoignages, FAQ
- **Médiathèque** : upload Cloudinary, dossiers, suppression
- **Paramètres** : coordonnées, réservation, réseaux sociaux

### Rôles
- `ADMIN` : accès complet
- `RECEPTIONIST` : rendez-vous et patients uniquement (appliqué dans le middleware **et** les API)
- `PATIENT` : ses propres réservations

## Démarrage rapide (développement)

```bash
# 1. Dépendances
npm install --legacy-peer-deps

# 2. Variables d'environnement
cp .env.example .env
# → renseignez DATABASE_URL et NEXTAUTH_SECRET (openssl rand -base64 32)

# 3. Base de données (PostgreSQL local ou docker compose up db -d)
npx prisma migrate dev --name init
npm run db:seed

# 4. Lancer
npm run dev
```

Compte admin par défaut (seed) : `admin@cabinet-physio.com` / `Admin123!` — **à changer immédiatement**.

> Sans `RESEND_API_KEY`, les emails ne partent pas mais sont journalisés dans la table `Notification` (le lien de vérification peut être récupéré en base pendant le développement). Idem pour WhatsApp sans les identifiants Meta.

## Déploiement avec Docker

```bash
cp .env.example .env   # renseignez au minimum NEXTAUTH_SECRET
docker compose up -d --build
# Première fois : seed des données
docker compose exec web sh -c "node_modules/.bin/prisma db seed" 2>/dev/null \
  || npx prisma db seed   # ou depuis l'hôte avec DATABASE_URL pointant vers le conteneur
```

Le conteneur applique automatiquement les migrations (`prisma migrate deploy`) au démarrage.

## Rappels automatiques

Planifiez un appel quotidien (cron, GitHub Actions, Vercel Cron...) :

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://votre-domaine.com/api/cron/reminders
```

Envoie un rappel email + WhatsApp pour tous les RDV confirmés du lendemain.

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (génère le client Prisma) |
| `npm run db:migrate` | Migration de développement |
| `npm run db:deploy` | Migrations en production |
| `npm run db:seed` | Données initiales (admin, soins, FAQ, horaires...) |
| `npm run db:studio` | Prisma Studio |

## Structure du projet

```
prisma/             Schéma + seed
src/
  app/
    (site)/         Pages publiques + espace patient
    (auth)/         Connexion, inscription, mots de passe, vérification email
    admin/          Panneau d'administration
    api/            Routes API (auth, rendez-vous, disponibilités, admin, cron)
  components/
    ui/             Composants shadcn-style (button, dialog, table...)
    site/           Navbar, footer, sections homepage, formulaires publics
    booking/        Formulaire de réservation multi-étapes
    account/        Espace patient
    admin/          Sidebar, gestionnaires (agenda, soins, contenu, médias...)
  lib/              Prisma, auth, email, WhatsApp, Cloudinary, créneaux, validations Zod
  middleware.ts     Protection des routes par rôle
```
