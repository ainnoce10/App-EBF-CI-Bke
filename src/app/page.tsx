"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { Zap, Shield, Clock, Users, Star, ArrowRight, X } from "lucide-react";
import SearchParamsHandler from "@/components/SearchParamsHandler";
import { FooterAdminButton } from "@/components/admin/FooterAdminButton";


export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [reviews, setReviews] = useState<{ id: string; name: string; rating: number; comment: string; date: string }[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ name: "", rating: 5, comment: "" });
  const [showContactModal, setShowContactModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initialize animations
    setIsVisible(true);
    
    // Charger les avis depuis la base de données
    const loadReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        const data = await response.json();
        
        if (data.success) {
          setReviews(data.reviews);
          // Si aucun avis n'existe, ajouter des avis par défaut
          if (data.reviews.length === 0) {
            const defaultReviews = [
              { id: "1", name: "Kouassi A.", rating: 5, comment: "Service excellent et rapide!", date: "2025-01-15" },
              { id: "2", name: "Touré M.", rating: 5, comment: "Travail professionnel, je recommande", date: "2025-01-14" },
              { id: "3", name: "Konaté F.", rating: 4, comment: "Satisfait du diagnostic gratuit", date: "2025-01-13" }
            ];
            setReviews(defaultReviews);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des avis:', error);
        // En cas d'erreur, utiliser les avis par défaut
        const defaultReviews = [
          { id: "1", name: "Kouassi A.", rating: 5, comment: "Service excellent et rapide!", date: "2025-01-15" },
          { id: "2", name: "Touré M.", rating: 5, comment: "Travail professionnel, je recommande", date: "2025-01-14" },
          { id: "3", name: "Konaté F.", rating: 4, comment: "Satisfait du diagnostic gratuit", date: "2025-01-13" }
        ];
        setReviews(defaultReviews);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    loadReviews();
    
    // Calculate time until December 31, 2025
    const calculateTimeLeft = () => {
      const targetDate = new Date('December 31, 2025 23:59:59').getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    // Initial calculation
    calculateTimeLeft();
    
    // Start timer after a small delay to improve initial load
    const timerId = setTimeout(() => {
      calculateTimeLeft();
      const timer = setInterval(calculateTimeLeft, 1000);
      
      return () => clearInterval(timer);
    }, 100);

    return () => clearTimeout(timerId);
  }, []);

  // Auto-rotate reviews
  useEffect(() => {
    const reviewInterval = setInterval(() => {
      setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 5000); // Change review every 5 seconds

    return () => clearInterval(reviewInterval);
  }, [reviews.length]);

  // Function to handle contact modal parameter
  const handleContactParam = (hasContact: boolean) => {
    if (hasContact) {
      setShowContactModal(true);
    }
  };

  // Calculate average rating with safety check
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1)
    : "4.9";

  // Get current review with safety check
  const currentReview = reviews.length > 0 && currentReviewIndex < reviews.length ? reviews[currentReviewIndex] : null;

  // Function to open review modal
  const openReviewModal = () => {
    setShowReviewModal(true);
  };

  // Function to handle review submission
  const submitReview = async () => {
    if (newReview.name.trim() && newReview.comment.trim()) {
      setIsSubmittingReview(true);
      try {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: newReview.name.trim(),
            rating: newReview.rating,
            comment: newReview.comment.trim(),
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          // Ajouter le nouvel avis au début de la liste
          const review = data.review;
          setReviews(prev => [review, ...prev]);
          setCurrentReviewIndex(0);
          setShowReviewModal(false);
          setNewReview({ name: "", rating: 5, comment: "" });
        } else {
          alert('Erreur lors de la soumission de l\'avis: ' + (data.error || 'Erreur inconnue'));
        }
      } catch (error) {
        console.error('Erreur lors de la soumission de l\'avis:', error);
        alert('Erreur de connexion. Veuillez réessayer plus tard.');
        
        // En cas d'erreur, ajouter localement pour une meilleure expérience utilisateur
        const review = {
          id: Date.now().toString(),
          name: newReview.name.trim(),
          rating: newReview.rating,
          comment: newReview.comment.trim(),
          date: new Date().toISOString().split('T')[0]
        };
        
        setReviews(prev => [review, ...prev]);
        setCurrentReviewIndex(0);
        setShowReviewModal(false);
        setNewReview({ name: "", rating: 5, comment: "" });
      } finally {
        setIsSubmittingReview(false);
      }
    }
  };

  // Function to handle rating change
  const handleRatingChange = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  // Function to open contact modal
  const openContactModal = () => {
    setShowContactModal(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden flex flex-col">
      <SearchParamsHandler onContactParam={handleContactParam} />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>


      {/* Header */}
      <header className="relative z-10 w-full py-2 px-4 bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-24 h-24 group transform transition-all duration-300 hover:scale-105">
                <Image
                  src="/ebf-logo-new.jpg"
                  alt="EBF Bouaké Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="96px"
                  quality={80}
                />
              </div>
              <div className="ml-4">
                <div className="flex items-center gap-2">
                  <Link href="/services" className="md:hidden text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 transform">
                    <Button variant="outline" size="sm" className="text-xs px-2 py-1 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                      Services
                    </Button>
                  </Link>
                  <h1 className="text-2xl font-bold text-blue-900 transform transition-all duration-300 hover:scale-105">
                    EBF Bouaké
                  </h1>
                </div>
                <p className="text-sm text-gray-600 mt-1">Électricité • Bâtiment • Froid</p>
              </div>
            </div>
            <nav className="flex space-x-6 items-center">
              <Link href="#about" className="hidden md:flex text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 transform">
                À propos
              </Link>
              <Link href="/services" className="hidden md:flex text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 transform">
                Nos services
              </Link>
              <Link href="#footer-contact" className="hidden md:flex text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 transform">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2 sm:py-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className={`space-y-6 sm:space-y-8 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} md:order-2`}>
            <div className="space-y-2 sm:space-y-4 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                💡 Problème d&apos;électricité à Bouaké ?
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-green-600 font-semibold animate-pulse">
                EBF vous offre un diagnostic GRATUIT à domicile !
              </p>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                Nos électriciens certifiés viennent diagnostiquer vos installations sans frais jusqu'à fin décembre !
              </p>
              <p className="text-base sm:text-lg text-red-600 font-bold leading-relaxed animate-pulse">
                ⚡ Offre limitée – Profitez-en vite ! ⚡
              </p>
            </div>

            {/* Countdown Timer */}
            <div className="text-center mb-6 transform transition-all duration-1000 delay-300">
              <div className="inline-block bg-yellow-400 text-yellow-900 px-3 py-1.5 rounded-full font-bold text-sm shadow-lg transform transition-all duration-300 hover:scale-105">
                Offre valable jusqu'au 31 décembre 2025
                <br />
                <span className="font-mono text-xs">
                  Encore {timeLeft.days}j {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                </span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start transform transition-all duration-1000 delay-500">
              <Link href="/signaler">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-base px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl group transform transition-all duration-300 hover:scale-110 animate-bounce"
                >
                  <span className="flex items-center text-base">
                    Signaler mon problème 
                    <Zap className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
                  </span>
                </Button>
              </Link>
              <Button 
                onClick={openContactModal}
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent hover:bg-blue-600 transition-all duration-300 cursor-pointer flex items-center transform hover:scale-105 rounded-full lg:rounded-full"
              >
                Nous contacter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className={`transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'} md:order-1`}>
            <div className="relative w-full h-96 md:h-[500px] lg:w-4/5 lg:mx-auto rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 hover:scale-105">
              <Image
                src="/uploads/photos/electricien-new.jpg"
                alt="Électricien professionnel EBF Bouaké"
                fill
                className="lg:object-contain object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                quality={75}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-0 left-6 right-6 text-white pb-2">
                {/* Average Rating */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= Math.round(parseFloat(averageRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm font-medium">
                    {isLoadingReviews ? 'Chargement...' : `${averageRating}/5 (${reviews.length + 10}+ avis)`}
                  </span>
                </div>
                
                {/* Current Review */}
                {isLoadingReviews ? (
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className="w-3 h-3 text-gray-300" 
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium">Chargement...</span>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed">Chargement des avis en cours...</p>
                  </div>
                ) : currentReview ? (
                  <div className="bg-black/30 backdrop-blur-sm rounded-lg p-3 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3 h-3 ${star <= (currentReview.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium">{currentReview.name || 'Anonyme'}</span>
                      </div>
                      <span className="text-xs text-gray-300">{currentReview.date || ''}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{currentReview.comment || ''}</p>
                  </div>
                ) : null}
                
                <p className="text-sm sm:text-lg font-semibold mt-2 mb-2">Plus de {reviews.length + 10}+ clients satisfaits à Bouaké</p>
                
                {/* Review Indicators */}
                {reviews.length > 0 && (
                  <div className="flex space-x-1 mt-2">
                    {reviews.map((_, index) => (
                      <div 
                        key={index} 
                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${index === currentReviewIndex ? 'bg-yellow-400' : 'bg-white/30'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Review Button moved near the image for PC */}
            <div className="hidden lg:block mt-4 text-center">
              <button 
                onClick={openReviewModal}
                className="text-base px-6 py-3 rounded-full font-semibold border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-500 hover:text-white bg-transparent hover:bg-yellow-500 transition-all duration-300 cursor-pointer flex items-center mx-auto transform hover:scale-105"
              >
                  Donner votre avis
                  <Star className="w-4 h-4 ml-2" />
              </button>
            </div>

            {/* Features Grid - After Image */}
            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 transform transition-all duration-1000 delay-1000">
              <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <Shield className="w-6 h-6 text-green-600 transform transition-all duration-300 hover:scale-110" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Garantie</p>
                  <p className="text-xs text-gray-600">Travail garanti</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <Clock className="w-6 h-6 text-blue-600 transform transition-all duration-300 hover:scale-110" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Rapide</p>
                  <p className="text-xs text-gray-600">Intervention 24/7</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <Users className="w-6 h-6 text-purple-600 transform transition-all duration-300 hover:scale-110" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Experts</p>
                  <p className="text-xs text-gray-600">Électriciens qualifiés</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105 hover:-translate-y-1">
                <Star className="w-6 h-6 text-yellow-600 transform transition-all duration-300 hover:scale-110 hover:rotate-12" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Excellence</p>
                  <p className="text-xs text-gray-600">Service premium</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full bg-gray-900 text-white py-12">
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
            
            <div id="footer-services">
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/services#electricite" className="hover:text-white transition-colors">Électricité</Link></li>
                <li><Link href="/services#batiment" className="hover:text-white transition-colors">Bâtiment</Link></li>
                <li><Link href="/services#froid" className="hover:text-white transition-colors">Froid</Link></li>
              </ul>
            </div>
            
            <div id="footer-contact">
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tél: +225 27 31 96 46 04</li>
                <li>Cel: +225 07 08 05 84 97</li>
                <li>WhatsApp: +225 07 08 05 84 97</li>
                <li>Email: ebfbouake@gmail.com</li>
                <li>Bouaké Tchêlêkro, Côte d'Ivoire</li>
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
            <div className="mt-4">
              <FooterAdminButton />
            </div>
          </div>
        </div>
      </footer>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Donner votre avis</h3>
                <button 
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre nom *
                  </label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Entrez votre nom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Note *
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRatingChange(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star 
                          className={`w-8 h-8 ${star <= newReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Votre commentaire *
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                    placeholder="Partagez votre expérience..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={submitReview}
                    disabled={!newReview.name.trim() || !newReview.comment.trim() || isSubmittingReview}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${!newReview.name.trim() || !newReview.comment.trim() || isSubmittingReview ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {isSubmittingReview ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer l\'avis'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Contact Modal */}
      {showContactModal && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowContactModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <span className="mr-3">📞</span>
                  Nos Contacts
                </h3>
                <button 
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Contact Cards */}
                <div className="grid gap-4">
                  {/* Phone Card */}
                  <a 
                    href="tel:+2252731964604"
                    className="bg-blue-50 p-4 rounded-xl border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">📱</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Téléphone</h4>
                        <p className="text-blue-600 font-medium">+225 27 31 96 46 04</p>
                        <p className="text-xs text-blue-500 mt-1">Cliquez pour appeler</p>
                      </div>
                    </div>
                  </a>

                  {/* Mobile Card */}
                  <a 
                    href="tel:+2250708058497"
                    className="bg-green-50 p-4 rounded-xl border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">📞</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Mobile</h4>
                        <p className="text-green-600 font-medium">+225 07 08 05 84 97</p>
                        <p className="text-xs text-green-500 mt-1">Cliquez pour appeler</p>
                      </div>
                    </div>
                  </a>

                  {/* WhatsApp Card */}
                  <a 
                    href="https://wa.me/2250708058497"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">💬</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">WhatsApp</h4>
                        <p className="text-emerald-600 font-medium">+225 07 08 05 84 97</p>
                        <p className="text-xs text-emerald-500 mt-1">Cliquez pour chatter - Disponible 24/7</p>
                      </div>
                    </div>
                  </a>

                  {/* Email Card */}
                  <a 
                    href="mailto:ebfbouake@gmail.com"
                    className="bg-purple-50 p-4 rounded-xl border border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">✉️</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Email</h4>
                        <p className="text-purple-600 font-medium">ebfbouake@gmail.com</p>
                        <p className="text-xs text-purple-500 mt-1">Cliquez pour envoyer un email</p>
                      </div>
                    </div>
                  </a>

                  {/* Location Card */}
                  <a 
                    href="https://maps.app.goo.gl/DRxemhmYjuHJimT29?g_st=aw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-orange-50 p-4 rounded-xl border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xl">📍</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Adresse</h4>
                        <p className="text-orange-600 font-medium">Bouaké Tchêlêkro, Côte d'Ivoire</p>
                        <p className="text-xs text-orange-500 mt-1">Cliquez pour voir l'itinéraire</p>
                      </div>
                    </div>
                  </a>
                </div>

                {/* Close Button */}
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="px-6 py-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
      )}
    </main>
  );
}
