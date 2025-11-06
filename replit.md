# EBF Bouaké - Replit Project

## Overview
Application Next.js 15 avec serveur personnalisé Socket.IO, Prisma (PostgreSQL), et Supabase pour le stockage de fichiers.

## État actuel (6 novembre 2025)
✅ **Migration Vercel → Replit terminée avec succès**
- Serveur configuré sur port 5000 (0.0.0.0)
- Socket.IO fonctionnel sur ws://0.0.0.0:5000/api/socketio
- Configuration Next.js adaptée pour Replit (allowedDevOrigins, sans X-Frame-Options)
- Scripts npm mis à jour pour utiliser les chemins directs des modules
- Configuration de déploiement en mode autoscale

## Configuration requise

### Variables d'environnement
Les variables suivantes sont configurées ou requises :

✅ **DATABASE_URL** - Déjà configuré (PostgreSQL Replit)
⚠️ **SUPABASE_URL** - Requis pour le stockage de fichiers (audio, images)
⚠️ **SUPABASE_KEY** - Requis pour le stockage de fichiers

### Prochaines étapes importantes

1. **Fournir les clés Supabase** (si demandé)
   - SUPABASE_URL : URL de votre projet Supabase
   - SUPABASE_KEY : Clé anon/public de votre projet

2. **Initialiser la base de données**
   ```bash
   npm run db:push
   ```
   Cela créera toutes les tables nécessaires (Customer, Technician, Request, User, Review, Message, etc.)

3. **Optionnel : Peupler avec des données de test**
   Si vous avez un script de seed, exécutez-le après avoir créé les tables.

## Architecture

### Stack technique
- **Frontend**: Next.js 15, React 19, TailwindCSS, Shadcn/ui
- **Backend**: Next.js API Routes + Serveur personnalisé
- **Base de données**: PostgreSQL via Prisma
- **Stockage fichiers**: Supabase Storage
- **Temps réel**: Socket.IO

### Structure des scripts
- `npm run dev` - Démarre le serveur de développement avec Socket.IO (port 5000)
- `npm run build` - Build de production (génère Prisma client + build Next.js)
- `npm run start` - Démarre le serveur de production avec Socket.IO
- `npm run db:push` - Synchronise le schéma Prisma avec la base de données
- `npm run db:generate` - Génère le client Prisma
- `npm run db:migrate` - Crée et applique une migration
- `npm run db:reset` - Réinitialise la base de données (⚠️ destructif)

### Serveur personnalisé
Le fichier `server.ts` configure un serveur HTTP qui gère :
1. Next.js (pages et API routes)
2. Socket.IO pour les connexions WebSocket temps réel

**Important** : Toujours utiliser les scripts npm (dev/start) plutôt que `next dev/start` directement, sinon Socket.IO ne sera pas disponible.

## Problèmes connus

### Base de données non initialisée
**Symptôme** : Erreur `PrismaClientKnownRequestError: The table 'public.Review' does not exist`

**Solution** : Exécuter `npm run db:push` pour créer les tables

### Stockage de fichiers non configuré
**Symptôme** : Erreurs lors de l'upload d'images ou audio

**Solution** : Fournir SUPABASE_URL et SUPABASE_KEY

## Notes de migration

### Changements effectués depuis Vercel
1. Port changé de 3000 → 5000 (requis par Replit)
2. Binding à 0.0.0.0 au lieu de localhost
3. Header X-Frame-Options supprimé (bloque l'iframe de prévisualisation Replit)
4. `allowedDevOrigins: ['*.replit.dev']` ajouté pour éviter les avertissements CORS
5. Scripts npm modifiés pour utiliser les chemins complets des binaires node_modules
6. Import dans server.ts changé de `@/lib/socket` → `./src/lib/socket.js` pour compatibilité tsx

### Configuration de déploiement
- **Type**: autoscale (pour applications web sans état)
- **Build**: Génération client Prisma + build Next.js
- **Run**: Serveur personnalisé avec tsx

## Support
Pour toute question ou problème, vérifiez d'abord :
1. Les logs du workflow dev-server
2. Que DATABASE_URL, SUPABASE_URL et SUPABASE_KEY sont correctement configurés
3. Que `npm run db:push` a été exécuté au moins une fois
