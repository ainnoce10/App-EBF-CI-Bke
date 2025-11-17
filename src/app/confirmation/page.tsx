"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, Zap, Shield, Star, Clock, Phone } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const TrackingButton = dynamic(() => import("@/components/TrackingButton").then(mod => ({ default: mod.TrackingButton })), { ssr: false });

export default function ConfirmationPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [trackingCode, setTrackingCode] = useState('EBF_XXXX');

  useEffect(() => {
    setIsVisible(true);
    setShowConfetti(true);
    
    // Get tracking code from URL
    if (typeof window !== 'undefined') {
      const code = new URLSearchParams(window.location.search).get('code');
      if (code) {
        setTrackingCode(code);
      }
    }
    
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-hidden">
      {/* Animated Background Elements - Reduced on Mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none hidden sm:block">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Confetti Effect - Fewer particles on mobile */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(typeof window !== 'undefined' && window.innerWidth < 640 ? 20 : 50)].map((_, i) => (
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
      <header className="relative z-10 w-full px-2 md:px-4 py-2 md:py-4 bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-1 md:space-x-3 min-w-0">
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-all duration-300 hover:scale-105 transform whitespace-nowrap text-sm md:text-base">
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Retour</span>
              </Link>
              <div className="hidden sm:block h-6 w-px bg-gray-300"></div>
              <h1 className="hidden sm:block text-lg md:text-2xl font-bold text-blue-900">Confirmation</h1>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
              <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                <CheckCircle className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Demande envoyée</span>
                <span className="sm:hidden">Envoyée</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-3 py-4 md:px-4 md:py-12 min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-4xl">
          <div className="grid md:grid-cols-2 gap-4 md:gap-12 items-center">
            {/* Left Content - Success Message */}
            <div className={`space-y-3 md:space-y-8 transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <div className="text-center">
                {/* Success Icon with Animation */}
                <div className="relative inline-block mb-4 md:mb-8">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                  <CheckCircle className="w-16 h-16 md:w-24 md:h-24 text-green-500 relative z-10 transform hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Success Message */}
                <div className="space-y-3 md:space-y-6">
                  <h2 className="text-2xl md:text-5xl font-bold text-gray-900 leading-tight">
                    🎉 Merci pour
                    <span className="text-green-600 animate-pulse"> votre confiance</span> !
                  </h2>
                  
                  <p className="text-sm md:text-xl text-gray-600 leading-relaxed">
                    Votre demande a été <span className="font-semibold text-blue-600">enregistrée avec succès</span> et nos experts sont déjà informés.
                  </p>
                  
                  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-lg font-medium">
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Intervention sous 24h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Contact Card */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
              <Card className="bg-white border-2 border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-4 md:p-8 space-y-3 md:space-y-6">
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900 text-center">
                    📝 Code de suivi
                  </h3>
                  
                  <div className="bg-blue-50 p-3 md:p-4 rounded-lg border-2 border-blue-200">
                    <p className="text-base md:text-lg font-mono text-center font-bold text-blue-800 break-all" id="trackingCode">
                      {trackingCode}
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-2 md:p-4 rounded-lg">
                    <p className="text-xs md:text-sm text-yellow-800">
                      ⚠️ Conservez précieusement ce code. Il vous permettra de suivre l'état de votre demande.
                    </p>
                  </div>

                  <div className="space-y-2 md:space-y-4">
                    <h4 className="font-semibold text-sm md:text-base text-gray-900">Prochaines étapes :</h4>
                    <ul className="space-y-1 md:space-y-3 text-xs md:text-base">
                      <li className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-4">📞</span>
                        <span className="text-gray-600">Nous vous appellerons dans les plus brefs délais</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-4">🏠</span>
                        <span className="text-gray-600">Un technicien se rendra à votre domicile</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-4">📋</span>
                        <span className="text-gray-600">Diagnostic gratuit de votre installation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-4">💰</span>
                        <span className="text-gray-600">Devis détaillé sans engagement</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-2 md:pt-4 space-y-2 md:space-y-3">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 md:py-3 text-sm md:text-lg"
                      onClick={() => {
                        const code = document.getElementById('trackingCode')?.textContent;
                        if (code) {
                          navigator.clipboard.writeText(code);
                          alert('Code de suivi copié !');
                        }
                      }}
                    >
                      📋 Copier le code
                    </Button>
                    <div className="w-full">
                      <TrackingButton />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-gray-900 text-white py-6 md:py-12">
        <div className="max-w-6xl mx-auto px-2 md:px-4 text-center">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6 mb-4 md:mb-8">
            <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-base">
              <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 flex-shrink-0" />
              <span>Intervention rapide</span>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-base">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0" />
              <span>Travail garanti</span>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-base">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-blue-400 flex-shrink-0" />
              <span>Experts certifiés</span>
            </div>
          </div>
          <p className="text-gray-400 text-xs md:text-base">
            © 2025 EBF Bouaké - Électricité - Bâtiment - Froid. Tous droits réservés.
          </p>
        </div>
      </footer>
    </main>
  );
}