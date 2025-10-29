"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowLeft, Zap, Shield, Star, Clock, Phone } from "lucide-react";
import Link from "next/link";

export default function ConfirmationPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setShowConfetti(true);
    
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

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
      <header className="relative z-10 w-full p-4 bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-all duration-300 hover:scale-105 transform">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-blue-900">Confirmation</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                <span>Demande envoyée</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content - Success Message */}
            <div className={`space-y-8 transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <div className="text-center">
                {/* Success Icon with Animation */}
                <div className="relative inline-block mb-8">
                  <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                  <CheckCircle className="w-24 h-24 text-green-500 relative z-10 transform hover:scale-110 transition-transform duration-300" />
                </div>

                {/* Success Message */}
                <div className="space-y-6">
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    🎉 Merci pour
                    <span className="text-green-600 animate-pulse"> votre confiance</span> !
                  </h2>
                  
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Votre demande a été <span className="font-semibold text-blue-600">enregistrée avec succès</span> et nos experts sont déjà informés.
                  </p>
                  
                  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-6 py-3 rounded-full text-lg font-medium">
                    <Clock className="w-5 h-5" />
                    <span>Intervention sous 24h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Contact Card */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
  
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-8">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span>Intervention rapide</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span>Travail garanti</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-blue-400" />
              <span>Experts certifiés</span>
            </div>
          </div>
          <p className="text-gray-400">
            © 2025 EBF Bouaké - Électricité - Bâtiment - Froid. Tous droits réservés.
          </p>
        </div>
      </footer>
    </main>
  );
}