"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Mail, Database, Settings } from "lucide-react";

export default function TestEnvPage() {
  const [envStatus, setEnvStatus] = useState<{
    databaseUrl: boolean;
    emailUser: boolean;
    emailPass: boolean;
    targetEmail: boolean;
    emailConfig: boolean;
  } | null>(null);
  const [emailTest, setEmailTest] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Vérifier les variables d'environnement côté client
    setEnvStatus({
      databaseUrl: !!process.env.NEXT_PUBLIC_DATABASE_URL,
      emailUser: !!process.env.NEXT_PUBLIC_EMAIL_USER,
      emailPass: !!process.env.NEXT_PUBLIC_EMAIL_PASS,
      targetEmail: !!process.env.NEXT_PUBLIC_TARGET_EMAIL,
      emailConfig: false,
    });
  }, []);

  const testEmailConfig = async () => {
    setIsLoading(true);
    setEmailTest(null);

    try {
      const response = await fetch('/api/test-notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setEmailTest({
          success: true,
          message: 'Email de test envoyé avec succès! Vérifiez votre boîte de réception Gmail.'
        });
      } else {
        setEmailTest({
          success: false,
          message: `Échec de l'envoi: ${data.error || 'Erreur inconnue'}`
        });
      }
    } catch (error) {
      setEmailTest({
        success: false,
        message: `Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="max-w-4xl mx-auto pt-20 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🔧 Page de Test - EBF Bouaké</h1>
          <p className="text-gray-600">Vérifiez la configuration de votre application déployée</p>
        </div>

        {/* Variables d'environnement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Variables d'Environnement
            </CardTitle>
            <CardDescription>
              Vérification des variables d'environnement nécessaires
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {envStatus ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Database URL</span>
                  {envStatus.databaseUrl ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Email User</span>
                  {envStatus.emailUser ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Email Pass</span>
                  {envStatus.emailPass ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Target Email</span>
                  {envStatus.targetEmail ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Chargement...</p>
            )}
          </CardContent>
        </Card>

        {/* Test Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Test Email
            </CardTitle>
            <CardDescription>
              Testez la configuration d'envoi d'email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Configuration attendue sur Vercel:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• EMAIL_USER: ebfbouake@gmail.com</li>
                <li>• EMAIL_PASS: zvvc yxqg qgsh jvqy</li>
                <li>• TARGET_EMAIL: ebfbouake@gmail.com</li>
                <li>• DATABASE_URL: file:./db/custom.db</li>
              </ul>
            </div>

            <Button 
              onClick={testEmailConfig} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Test en cours...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer un email de test
                </>
              )}
            </Button>

            {emailTest && (
              <Alert className={emailTest.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <div className="flex items-center gap-2">
                  {emailTest.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <AlertDescription className={emailTest.success ? "text-green-800" : "text-red-800"}>
                    {emailTest.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Instructions de Déploiement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold">1. Sur Vercel:</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Allez dans Settings → Environment Variables</li>
                <li>Ajoutez toutes les variables listées ci-dessus</li>
                <li>Sélectionnez "Production", "Preview", "Development"</li>
                <li>Redéployez votre projet</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold">2. Notes importantes:</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>SQLite sur Vercel sera réinitialisé à chaque déploiement</li>
                <li>Pour la production, envisagez une base de données externe</li>
                <li>Les variables d'environnement ne sont pas visibles côté client</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}