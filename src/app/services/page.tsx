"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Zap, Shield, Star, ArrowRight, Phone, Mail, MapPin, Clock, ArrowLeft, Building } from "lucide-react";

export default function ServicesPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const services = {
    electricite: {
      icon: <Zap className="w-8 h-8" />,
      title: "Électricité",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
      hoverBg: "hover:bg-orange-50",
      iconBg: "bg-orange-500",
      items: [
        "Dépannage d'urgence 24/7",
        "Installation électrique neuve",
        "Mise aux normes électriques",
        "Tableaux électriques",
        "Éclairage intérieur et extérieur",
        "Prises et interrupteurs",
        "Diagnostic électrique complet",
        "Réseau de terre et parafoudres"
      ]
    },
    batiment: {
      icon: <Building className="w-8 h-8" />,
      title: "Bâtiment",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      hoverBg: "hover:bg-green-50",
      iconBg: "bg-green-500",
      items: [
        "Rénovation électrique complète",
        "Construction neuve",
        "Câblage industriel",
        "Gestion technique du bâtiment (GTB)",
        "Automatisme et contrôle",
        "Contrôle d'accès",
        "Vidéo surveillance",
        "Alarmes et sécurité"
      ]
    },
    froid: {
      icon: <Star className="w-8 h-8" />,
      title: "Froid",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      hoverBg: "hover:bg-blue-50",
      iconBg: "bg-blue-500",
      items: [
        "Climatisation réversible",
        "Installation de climatisation",
        "Entretien climatisation",
        "Dépannage climatisation",
        "Chambres froides professionnelles",
        "Réfrigération commerciale",
        "Pompes à chaleur",
        "Ventilation industrielle"
      ]
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="w-full p-4 bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-16 h-16 group">
                <Image
                  src="/ebf-logo-new.jpg"
                  alt="EBF Bouaké Logo"
                  fill
                  className="object-contain transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-blue-600 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>
              <div className="ml-4">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-blue-900 transform hover:scale-105 transition-transform duration-300">
                    EBF Bouaké
                  </h1>
                  <div className="ml-4 md:hidden">
                    <Link href="/" className="flex items-center px-3 py-2 text-xs rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:scale-105 transform font-semibold">
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Retour
                    </Link>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Électricité • Bâtiment • Froid</p>
              </div>
            </div>
            <nav className="flex space-x-6">
              <Link href="/" className="hidden md:flex items-center px-3 py-2 text-sm rounded-lg border border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300 hover:scale-105 transform font-semibold">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Retour
              </Link>
              <Link href="#about" className="hidden md:flex text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:scale-105 transform">
                À propos
              </Link>
              <Link href="/?contact=true" className="hidden md:flex text-gray-700 hover:text-blue-600 transition-colors duration-300 hover:scale-105 transform">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Nos Services Professionnels
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Découvrez notre gamme complète de services en électricité, bâtiment et froid pour tous vos projets à Bouaké
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/signaler">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xl px-8 py-4 rounded-full font-bold shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-3xl"
                >
                  Demander un devis gratuit
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/?contact=true">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-xl px-8 py-4 rounded-full font-bold border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transform transition-all duration-300 hover:scale-110"
                >
                  Nous contacter
                  <Phone className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Object.entries(services).map(([key, category], index) => (
              <div 
                key={key}
                id={key}
                className={`transform transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`h-full bg-white rounded-xl shadow-sm border ${category.borderColor} ${category.hoverBg} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}>
                  {/* Header */}
                  <div className={`p-6 border-b ${category.borderColor} ${category.bgColor} transition-colors duration-300`}>
                    <div className="flex items-center space-x-4">
                      <div className={`flex-shrink-0 w-12 h-12 ${category.iconBg} rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
                        <div className="text-white">
                          {category.icon}
                        </div>
                      </div>
                      <div>
                        <h3 className={`text-xl font-semibold ${category.color} transition-colors duration-300`}>
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {category.items.length} services disponibles
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <ul className="space-y-3">
                      {category.items.map((service, serviceIndex) => (
                        <li 
                          key={serviceIndex}
                          className="flex items-start space-x-3 group/item"
                        >
                          <div className={`flex-shrink-0 w-1.5 h-1.5 ${category.color.replace('text-', 'bg-')} rounded-full mt-2 transition-all duration-200 group-hover/item:scale-125`}></div>
                          <span className="text-gray-700 text-sm leading-relaxed group-hover/item:text-gray-900 transition-colors duration-200">
                            {service}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Footer */}
                  <div className={`px-6 py-4 ${category.bgColor} border-t ${category.borderColor} transition-colors duration-300`}>
                    <Link 
                      href="/signaler" 
                      className={`inline-flex items-center text-sm font-medium ${category.color} hover:opacity-80 transition-opacity duration-200`}
                    >
                      Demander un devis
                      <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à commencer votre projet ?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Nos experts sont disponibles 24/7 pour vous accompagner dans tous vos projets électriques, de bâtiment et de froid.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/signaler">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="text-blue-600 text-xl px-8 py-4 rounded-full font-bold shadow-2xl transform transition-all duration-300 hover:scale-110 hover:shadow-3xl bg-white hover:bg-gray-100"
                >
                  Signaler un problème
                  <Zap className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/?contact=true">
                <Button 
                  size="lg"
                  variant="outline"
                  className="text-white text-xl px-8 py-4 rounded-full font-bold border-2 border-white hover:bg-white hover:text-blue-600 transform transition-all duration-300 hover:scale-110"
                >
                  Contactez-nous
                  <Phone className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

  

      {/* Footer */}
      <footer className="w-full bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative w-12 h-12">
                  <Image
                    src="/ebf-logo-new.jpg"
                    alt="EBF Bouaké Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold">EBF Bouaké</h3>
              </div>
              <p className="text-gray-400">
                Votre partenaire de confiance pour tous vos projets d'électricité, de bâtiment et de froid à Bouaké.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Électricité</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Bâtiment</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Froid</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Dépannage</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tél: +225 27 31 96 46 04</li>
                <li>Cel: +225 07 08 05 84 97</li>
                <li>Bouaké, Côte d'Ivoire</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link></li>
                <li><Link href="/politique-confidentialite" className="hover:text-white transition-colors">Politique de confidentialité</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 EBF Bouaké - Électricité - Bâtiment - Froid. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}