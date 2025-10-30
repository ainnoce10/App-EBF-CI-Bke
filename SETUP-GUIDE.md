# Guide de Configuration - EBF Bouaké

## Solution Gratuite Complète avec Supabase

Ce guide vous aidera à configurer une solution complète et gratuite pour votre site EBF Bouaké, incluant :

- **Base de données** : PostgreSQL avec Supabase (500 Mo gratuits)
- **Stockage de fichiers** : Supabase Storage (1 Go gratuit)
- **Hébergement** : Vercel (gratuit)
- **Services supplémentaires** : Authentification, fonctions edge, etc.

## Étape 1: Configuration de Supabase

### 1.1 Créer un compte Supabase
1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "Start your project" ou "Sign Up"
3. Inscrivez-vous avec GitHub (recommandé) ou avec votre email
4. Vérifiez votre email

### 1.2 Créer un projet Supabase
1. Connectez-vous à votre dashboard Supabase
2. Cliquez sur "New Project"
3. Remplissez les informations :
   - **Organization** : Votre organisation ou "EBF Bouaké"
   - **Project Name** : `ebf-bouake`
   - **Database Password** : Choisissez un mot de passe fort (notez-le !)
   - **Region** : Choisissez la région la plus proche (ex: `eu-west-1`)
4. Cliquez sur "Create new project"
5. Attendez 2-3 minutes pendant la création

### 1.3 Récupérer les informations de connexion

#### Base de données :
1. Allez dans l'onglet "Settings" > "Database"
2. Cherchez la section "Connection string"
3. Copiez la chaîne URI :
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
   ```

#### Configuration API :
1. Allez dans l'onglet "Settings" > "API"
2. Cherchez la section "Project API keys"
3. Copiez :
   - **Project URL** : `https://[YOUR-PROJECT].supabase.co`
   - **service_role_key** : La clé complète commençant par `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Étape 2: Configuration du Projet

### 2.1 Mettre à jour le fichier .env
1. Copiez `.env.example` vers `.env`
2. Remplacez les variables avec vos informations Supabase :

```env
# Configuration de la base de données Supabase
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres

# Configuration Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuration de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2.2 Installer les dépendances
```bash
npm install @supabase/supabase-js
```

### 2.3 Tester la configuration
```bash
node scripts/test-supabase.js
```

Vous devriez voir :
```
🔍 Test de configuration Supabase...
📊 Test 1: Connexion à la base de données...
✅ Connexion à la base de données réussie !
📁 Test 2: Connexion à Supabase Storage...
🪣 Test 3: Création du bucket de stockage...
✅ Bucket créé avec succès !
📤 Test 4: Upload d'un fichier test...
✅ Fichier uploadé avec succès !
🔗 Test 5: Obtention de l'URL publique...
✅ URL publique obtenue : https://[YOUR-PROJECT].supabase.co/storage/v1/object/public/ebf-bouake/test/test-file.txt
🧹 Test 6: Nettoyage...
✅ Nettoyage réussi !
👤 Test 7: Création d'un client test...
✅ Client test créé ! ID: xxxxxxxx
✅ Client test supprimé !
🎉 Tous les tests Supabase ont réussi !
🚀 Votre projet est prêt à être déployé !
```

### 2.4 Pousser le schéma de base de données
```bash
npm run db:push
```

## Étape 3: Configuration de Vercel

### 3.1 Créer un projet Vercel
1. Connectez-vous à [https://vercel.com](https://vercel.com)
2. Cliquez sur "New Project"
3. Connectez votre dépôt Git (GitHub, GitLab, etc.)
4. Sélectionnez votre projet EBF Bouaké

### 3.2 Configurer les variables d'environnement
1. Allez dans l'onglet "Settings" > "Environment Variables"
2. Ajoutez les variables suivantes :

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
NODE_ENV=production
```

### 3.3 Déployer
1. Cliquez sur "Deploy"
2. Attendez la fin du déploiement
3. Visitez votre site déployé

## Étape 4: Tests et Validation

### 4.1 Tester le formulaire
1. Allez sur votre site déployé
2. Remplissez le formulaire de demande avec :
   - Nom: "Test Supabase"
   - Téléphone: "+225 07 07 07 07"
   - Quartier: "N'Gattakro"
   - Description: "Test avec Supabase"
3. Cliquez sur "Envoyer la demande"

### 4.2 Vérifier les données dans Supabase
1. Connectez-vous à votre dashboard Supabase
2. Allez dans l'onglet "Table Editor"
3. Vérifiez les tables :
   - `Customer` : informations du client
   - `Request` : la demande créée
   - `Message` : le message interne

### 4.3 Vérifier les fichiers
1. Allez dans l'onglet "Storage" de Supabase
2. Cliquez sur le bucket "ebf-bouake"
3. Vérifiez que les fichiers uploadés apparaissent

## Étape 5: Fonctionnalités Supabase

### 5.1 Tableau de bord Supabase
Le dashboard Supabase offre plusieurs fonctionnalités :

- **Table Editor** : Gérer vos données
- **SQL Editor** : Exécuter des requêtes SQL
- **Storage** : Gérer les fichiers
- **Authentication** : Gérer les utilisateurs
- **Functions** : Fonctions edge
- **Logs** : Voir les logs

### 5.2 Avantages de Supabase
- **Gratuit** : 500 Mo de base de données, 1 Go de stockage
- **Complet** : Base de données, stockage, authentification, fonctions
- **Facile** : Interface intuitive
- **Scalable** : Facile à mettre à niveau
- **Open Source** : Basé sur PostgreSQL

### 5.3 Limites Gratuites
- **Base de données** : 500 Mo
- **Stockage** : 1 Go
- **Bande passante** : 2 Go/mois
- **Connexions simultanées** : 60
- **Fonctions edge** : 1 Go/mois

## Étape 6: Surveillance et Maintenance

### 6.1 Surveillance dans Supabase
1. Allez dans l'onglet "Logs"
2. Surveillez les erreurs et les performances
3. Utilisez le "Table Editor" pour gérer les données

### 6.2 Sauvegardes
- **Base de données** : Supabase effectue des sauvegardes automatiques quotidiennes
- **Fichiers** : Les fichiers dans Storage sont répliqués automatiquement

### 6.3 Nettoyage
1. Allez dans l'onglet "Storage"
2. Supprimez les anciens fichiers si nécessaire
3. Utilisez le "Table Editor" pour nettoyer les données

## Dépannage

### Problèmes courants

#### 1. Erreur de connexion à la base de données
```
Could not connect to the database
```
**Solution** :
- Vérifiez votre `DATABASE_URL`
- Vérifiez que votre projet Supabase est actif
- Vérifiez le mot de passe de la base de données

#### 2. Erreur de configuration Supabase
```
Invalid API key
```
**Solution** :
- Vérifiez votre `SUPABASE_SERVICE_ROLE_KEY`
- Assurez-vous d'utiliser la bonne clé (service_role, pas anon)

#### 3. Erreur d'upload de fichier
```
Storage bucket not found
```
**Solution** :
- Exécutez `node scripts/test-supabase.js` pour créer le bucket
- Vérifiez les permissions du bucket

#### 4. Erreur de déploiement
```
Build failed
```
**Solution** :
- Vérifiez les erreurs dans les logs de déploiement
- Exécutez `npm run lint` localement
- Vérifiez que toutes les variables d'environnement sont configurées

### Support

- **Supabase** : [https://supabase.com/docs](https://supabase.com/docs)
- **Vercel** : [https://vercel.com/docs](https://vercel.com/docs)
- **Next.js** : [https://nextjs.org/docs](https://nextjs.org/docs)

## Quand passer à un plan payant ?

### Indicateurs pour passer à un plan payant :
- Plus de 500 Mo de base de données
- Plus de 1 Go de stockage de fichiers
- Plus de 1000 utilisateurs actifs par jour
- Besoin de plus de bande passante
- Besoin de fonctions supplémentaires

### Plans Supabase :
- **Pro** : $25/mois - 8 Go base de données, 100 Go stockage
- **Team** : $599/mois - Bases de données illimitées, 500 Go stockage

## Conclusion

Votre site EBF Bouaké est maintenant configuré avec une solution complète et gratuite qui peut gérer :

- ✅ **Texte** : via la base de données PostgreSQL (500 Mo gratuits)
- ✅ **Images** : via Supabase Storage (1 Go gratuit, jusqu'à 10MB par image)
- ✅ **Audio** : via Supabase Storage (1 Go gratuit, jusqu'à 50MB par fichier)

La solution est robuste, scalable et vous offre beaucoup plus qu'une simple base de données. Vous bénéficiez de l'écosystème complet Supabase avec authentification, fonctions edge, et bien plus encore.

Le passage à un plan payant sera facile lorsque votre site grandira, et vous pourrez conserver la même architecture.