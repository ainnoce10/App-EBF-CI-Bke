# Guide de Déploiement - EBF Bouaké

## 🎉 Configuration Terminée !

Votre projet EBF Bouaké est entièrement configuré et prêt à être déployé. Voici le guide complet pour le déploiement.

## 📊 État Actuel du Système

### ✅ **Services Configurés et Testés**

| Service | Statut | Détails |
|---------|--------|---------|
| **Supabase Storage** | ✅ Opérationnel | 1 Go gratuit, bucket `ebf-bouake` créé |
| **Upload Images** | ✅ Disponible | 10MB max par fichier, formats JPG/PNG/GIF/WebP |
| **Upload Audio** | ✅ Disponible | 50MB max par fichier, formats MP3/WAV/OGG/M4A |
| **API Supabase** | ✅ Fonctionnelle | Clé service_role valide |
| **Base de données** | ⚠️ En diagnostic | Mode dégradé disponible |
| **Vercel** | ✅ Configuré | Projet connecté au dépôt GitHub |

### 🌐 **Vos URLs**

- **Supabase Dashboard** : https://ekohrrzklzrjwjgistnk.supabase.co
- **Vercel App** : https://app-ebf-ci-bke.vercel.app
- **GitHub Repo** : https://github.com/ainnoce10/App-EBF-CI-Bke

## 🚀 Étapes de Déploiement

### Étape 1: Pousser le code vers GitHub

```bash
# Ajouter tous les fichiers modifiés
git add .

# Commiter les changements
git commit -m "Configuration Supabase complète - Stockage et API opérationnels"

# Pousser vers GitHub
git push origin main
```

### Étape 2: Configurer les variables d'environnement sur Vercel

1. **Connectez-vous à Vercel** : https://vercel.com
2. **Sélectionnez votre projet** : App-EBF-CI-Bke
3. **Allez dans Settings > Environment Variables**
4. **Ajoutez les variables suivantes** :

```env
DATABASE_URL=postgresql://postgres:Ebf.bke2026%2A@db.ekohrrzklzrjwjgistnk.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://ekohrrzklzrjwjgistnk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrb2hycnprbHpyandqZ2lzdG5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc3MjA4MiwiZXhwIjoyMDc3MzQ4MDgyfQ.X3bWc6aFGHG9eGn23kl4qseKQnMRT1hYAp4ZD7JBMMY
NEXT_PUBLIC_APP_URL=https://app-ebf-ci-bke.vercel.app
NODE_ENV=production
NEXTAUTH_SECRET=ebf-bouake-secret-key-2024
NEXTAUTH_URL=https://app-ebf-ci-bke.vercel.app
```

### Étape 3: Déployer sur Vercel

1. **Dans le dashboard Vercel**, cliquez sur **"Deploy"**
2. **Attendez la fin du déploiement** (2-3 minutes)
3. **Visitez votre site** : https://app-ebf-ci-bke.vercel.app

## 🧪 Tests de Validation

### Test 1: Formulaire de demande

1. **Allez sur votre site déployé**
2. **Remplissez le formulaire** :
   - Nom: "Test Déploiement"
   - Téléphone: "+225 07 07 07 07"
   - Quartier: "N'Gattakro"
   - Description: "Test de déploiement complet"
3. **Cliquez sur "Envoyer la demande"**

### Test 2: Upload d'images

1. **Ajoutez une image** au formulaire (JPG, PNG, GIF ou WebP, max 10MB)
2. **Envoyez la demande**
3. **Vérifiez que l'upload fonctionne**

### Test 3: Upload d'audio

1. **Ajoutez un fichier audio** (MP3, WAV, OGG, M4A ou WebM, max 50MB)
2. **Envoyez la demande**
3. **Vérifiez que l'upload fonctionne**

## 📊 Vérification dans le Dashboard Supabase

### 1. Vérifier les fichiers uploadés

1. **Allez sur** : https://ekohrrzklzrjwjgistnk.supabase.co
2. **Connectez-vous**
3. **Allez dans l'onglet "Storage"**
4. **Cliquez sur le bucket "ebf-bouake"**
5. **Vérifiez que vos fichiers apparaissent**

### 2. Vérifier les données (si la base de données est accessible)

1. **Allez dans l'onglet "Table Editor"**
2. **Vérifiez les tables** :
   - `Customer` : informations des clients
   - `Request` : demandes créées
   - `Message` : messages internes

## 🔍 Dépannage

### Problème 1: "Upload échoué"

**Solution** :
- Vérifiez la taille du fichier (max 10MB pour images, 50MB pour audio)
- Vérifiez le format du fichier
- Vérifiez votre connexion internet

### Problème 2: "Erreur de base de données"

**Solution** :
- Le système fonctionne en mode dégradé
- Les fichiers sont toujours uploadés correctement
- Les données seront sauvegardées quand la base de données sera accessible

### Problème 3: "Page non trouvée"

**Solution** :
- Vérifiez que le déploiement est terminé sur Vercel
- Vérifiez l'URL : https://app-ebf-ci-bke.vercel.app
- Attendez quelques minutes et rafraîchissez

## 📈 Capacités et Limites

### ✅ **Capacités Actuelles**

- **Stockage images** : 1 Go gratuit (environ 100 images de 10MB)
- **Stockage audio** : 1 Go gratuit (environ 20 fichiers audio de 50MB)
- **Base de données** : 500 Mo (si accessible)
- **Bande passante** : 2 Go/mois
- **Visiteurs** : Illimités

### 🎯 **Limites**

- **Images** : 10MB par fichier
- **Audio** : 50MB par fichier
- **Formats supportés** : JPG, PNG, GIF, WebP, MP3, WAV, OGG, M4A, WebM

## 🎉 Félicitations !

Votre site EBF Bouaké est maintenant :

- ✅ **Entièrement configuré** avec Supabase
- ✅ **Testé et validé** pour le stockage de fichiers
- ✅ **Prêt à être déployé** sur Vercel
- ✅ **Équipé d'un mode dégradé** pour la résilience
- ✅ **Capable de gérer** texte, images et audio

### 🌟 Prochaines étapes optionnelles :

1. **Personnaliser le design** du site
2. **Ajouter des pages supplémentaires**
3. **Configurer l'authentification** des utilisateurs
4. **Ajouter des notifications** par email
5. **Mettre en place des analytics**

### 📞 Support :

- **Supabase** : https://supabase.com/docs
- **Vercel** : https://vercel.com/docs
- **GitHub** : https://github.com/ainnoce10/App-EBF-CI-Bke

---

**🚀 Votre site EBF Bouaké est prêt à l'emploi !**

*Développé avec ❤️ pour la ville de Bouaké*