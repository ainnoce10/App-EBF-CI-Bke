Write-Host "🚀 Configuration de l'environnement..." -ForegroundColor Cyan

# 1. Vérifier Node.js et npm
Write-Host "📝 Vérification de Node.js et npm..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    $npmVersion = npm -v
    Write-Host "✅ Node.js ($nodeVersion) et npm ($npmVersion) sont installés" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js n'est pas installé. Installation via winget..." -ForegroundColor Red
    winget install OpenJS.NodeJS.LTS
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation de Node.js. Visitez https://nodejs.org pour l'installer manuellement." -ForegroundColor Red
        exit 1
    }
}

# 2. Configurer l'URL de la base de données
Write-Host "📝 Configuration de l'URL de la base de données..." -ForegroundColor Yellow
$env:DATABASE_URL = "postgresql://postgres:Ebf.bke2026*@db.ekohrrzklzrjwjgistnk.supabase.co:5432/postgres"
[System.IO.File]::WriteAllText("$pwd\.env.local", "DATABASE_URL=`"$env:DATABASE_URL`"")
Write-Host "✅ Fichier .env.local créé" -ForegroundColor Green

# 3. Installer les dépendances
Write-Host "📝 Installation des dépendances..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dépendances installées" -ForegroundColor Green

# 4. Générer le client Prisma
Write-Host "📝 Génération du client Prisma..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la génération du client Prisma" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Client Prisma généré" -ForegroundColor Green

# 5. Push du schéma vers Supabase
Write-Host "📝 Push du schéma vers Supabase..." -ForegroundColor Yellow
npx prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du push du schéma" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Schéma synchronisé avec Supabase" -ForegroundColor Green

# 6. Lancer l'application
Write-Host "🚀 Démarrage de l'application..." -ForegroundColor Cyan
npm run dev