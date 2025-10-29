"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, Zap, Shield, Star, Clock, Phone, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ConfirmationPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsVisible(true);
    setShowConfetti(true);
    
    // Récupérer le code de suivi depuis les paramètres d'URL ou le localStorage
    const codeFromUrl = searchParams.get('code');
    const codeFromStorage = localStorage.getItem('trackingCode');
    
    if (codeFromUrl) {
      setTrackingCode(codeFromUrl);
    } else if (codeFromStorage) {
      setTrackingCode(codeFromStorage);
      // Nettoyer le localStorage après utilisation
      localStorage.removeItem('trackingCode');
    }
    
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const copyToClipboard = async () => {
    if (trackingCode) {
      try {
        await navigator.clipboard.writeText(trackingCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-red-500 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 w-full p-3 md:p-4 bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-all duration-300 hover:scale-105 transform">
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                <span className="text-sm md:text-base">Retour</span>
              </Link>
              <div className="h-4 md:h-6 w-px bg-gray-300"></div>
              <h1 className="text-lg md:text-2xl font-bold text-blue-900">Confirmation</h1>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2">
              <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden md:inline">Demande envoyée</span>
                <span className="md:hidden">Envoyée</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 md:py-12">
        <div className="max-w-4xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content - Success Message */}
            <div className={`space-y-4 md:space-y-8 transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <div className="text-center">
                {/* Success Icon with Animation */}
                <div className="relative inline-block mb-4 md:mb-8">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                  <CheckCircle className="w-16 h-16 md:w-24 md:h-24 text-green-500 relative z-10 transform hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Success Message */}
                <div className="space-y-3 md:space-y-6">
                  <h2 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                    🎉 Merci pour
                    <span className="text-green-600 animate-pulse"> votre confiance</span> !
                  </h2>
                  
                  <p className="text-base md:text-xl text-gray-600 leading-relaxed">
                    Votre demande a été <span className="font-semibold text-blue-600">enregistrée avec succès</span> et nos experts sont déjà informés.
                  </p>
                  
                  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm md:text-lg font-medium">
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Intervention sous 24h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Contact Card */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
              <Card className="bg-white shadow-xl border-0">
                <CardContent className="p-4 md:p-8">
                  <div className="text-center mb-4 md:mb-6">
                    <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">Votre code de suivi</h3>
                    <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-6">
                      Gardez ce code précieusement pour suivre l'état de votre demande
                    </p>
                  </div>

                  {trackingCode ? (
                    <div className="space-y-3 md:space-y-4">
                      <div 
                        className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-xl p-4 md:p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                        onClick={copyToClipboard}
                      >
                        <div className="text-center">
                          <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Cliquez pour copier</p>
                          <div className="text-3xl md:text-4xl font-mono font-bold text-blue-600 mb-1 md:mb-2">
                            {trackingCode}
                          </div>
                          <div className="flex items-center justify-center text-xs md:text-sm text-gray-500">
                            {copied ? (
                              <>
                                <Check className="w-3 h-3 md:w-4 md:h-4 mr-1 text-green-600" />
                                <span className="text-green-600">Copié !</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                                <span>Copier le code</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
                        <p className="text-xs md:text-sm text-yellow-800">
                          <strong>Important :</strong> Ce code vous permettra de vérifier l'état de votre demande 
                          et de suivre l'intervention de nos techniciens.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 md:py-8">
                      <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full mb-2 md:mb-4">
                        <Clock className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                      </div>
                      <p className="text-sm md:text-base text-gray-500">
                        Chargement de votre code de suivi...
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-gray-900 text-white py-6 md:py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-3 md:space-y-0 md:space-x-8 mb-4 md:mb-8">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
              <span className="text-sm md:text-base">Intervention rapide</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
              <span className="text-sm md:text-base">Travail garanti</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              <span className="text-sm md:text-base">Experts certifiés</span>
            </div>
          </div>
          <p className="text-gray-400 text-xs md:text-sm">
            © 2025 EBF Bouaké - Électricité - Bâtiment - Froid. Tous droits réservés.
          </p>
        </div>
      </footer>
    </main>
  );
}