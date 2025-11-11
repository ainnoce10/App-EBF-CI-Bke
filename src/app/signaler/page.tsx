"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mic, Square, Play, Upload, Loader2, MapPin, Shield, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignalerPage() {
  const [inputType, setInputType] = useState<"text" | "audio">("text");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSuccess, setLocationSuccess] = useState<string | null>(null);
  const [showLocationToast, setShowLocationToast] = useState(false);
  const [position, setPosition] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const textSectionRef = useRef<HTMLDivElement>(null);
  const audioSectionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Initialize animations
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Initialize audio recording
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      console.log("🎤 Demande d'accès au microphone...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log('✅ Microphone autorisé, enregistrement en cours...');
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error: any) {
      console.error('❌ Erreur accès microphone:', error);
      
      // Messages simples, sans demander de manipulations
      let errorMessage = "⏸️ Microphone non disponible. C'est optionnel.";

      if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
        errorMessage = "⏸️ Microphone non autorisé. Vous pouvez continuer en décrivant votre problème par écrit.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = "🎤 Pas de microphone détecté.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "⏸️ Microphone inaccessible. Essayez plus tard.";
      }

      console.log('ℹ️', errorMessage);
      // Afficher l'erreur dans la console, pas d'alert bloquante
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("audio/")) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setAudioBlob(file);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ L'image est trop volumineuse. La taille maximale est de 5MB.");
        return;
      }
      
      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert("❌ Format non supporté. Veuillez utiliser JPG, PNG ou GIF.");
        return;
      }
      
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      
      // Feedback visuel de succès
      const uploadArea = event.target.closest('.border-dashed');
      if (uploadArea) {
        uploadArea.classList.add('animate-pulse');
        setTimeout(() => {
          uploadArea.classList.remove('animate-pulse');
        }, 1000);
      }
    } else if (file && !file.type.startsWith("image/")) {
      alert("❌ Veuillez sélectionner un fichier image valide.");
    }
  };

  // Scroll to description section
  const scrollToTextSection = () => {
    setTimeout(() => {
      textSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 100);
  };

  const scrollToAudioSection = () => {
    setTimeout(() => {
      audioSectionRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 100);
  };

  const handleGeolocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Géolocalisation non supportée");
      return;
    }

    setLocationLoading(true);
    setLocationError(null);
    setLocationSuccess(null);

    try {
      // Demander simplement la position sans pré-vérifier les permissions
      // Laisser le navigateur gérer la demande de permission
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve(pos),
          (error) => reject(error),
          {
            enableHighAccuracy: false, // Désactiver high accuracy pour plus de compatibilité
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const coordinates = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      
      setPosition(coordinates);
      setMapsLink(googleMapsLink);
      setLocationSuccess("✅ Position ajoutée avec succès !");
      setShowLocationToast(true);
      setLocationLoading(false);
      
      // Cacher le toast après 3 secondes
      setTimeout(() => {
        setShowLocationToast(false);
      }, 3000);
      
    } catch (error: any) {
      setLocationLoading(false);
      
      // Messages d'erreur simples (sans demander manipulation)
      if (error.code === error.PERMISSION_DENIED) {
        setLocationError("⏸️ Position non autorisée. C'est optionnel — vous pouvez continuer sans.");
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        setLocationError("📡 Position indisponible. C'est normal à l'intérieur — vous pouvez continuer.");
      } else if (error.code === error.TIMEOUT) {
        setLocationError("⏱️ Position introuvable. Essayez dans quelques secondes.");
      } else {
        setLocationError("Position non disponible. Ce n'est pas obligatoire.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser les erreurs
    setFormError(null);
    
    if (!name.trim()) {
      setFormError("Veuillez fournir votre nom");
      return;
    }

    if (!phone.trim()) {
      setFormError("Veuillez fournir votre numéro de téléphone");
      return;
    }

    if (!authorized) {
      setFormError("Veuillez autoriser EBF à vous recontacter");
      return;
    }

    if (inputType === "text" && !description.trim()) {
      setFormError("Veuillez décrire votre problème");
      return;
    }

    // Note: Audio est optionnel — on peut soumettre sans enregistrement audio

    setIsSubmitting(true);

    try {
      console.log('📤 Envoi de la demande...');
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("neighborhood", neighborhood);
      formData.append("position", position);
      formData.append("inputType", inputType);
      
      if (inputType === "text") {
        formData.append("description", description);
      } else if (audioBlob) {
        formData.append("audio", audioBlob, "recording.wav");
      }

      // Ajouter la photo si elle existe
      const photoInput = document.getElementById('photo') as HTMLInputElement;
      if (photoInput && photoInput.files && photoInput.files[0]) {
        formData.append("photo", photoInput.files[0]);
      }

      console.log('📡 Appel API...');
      const response = await fetch("/api/requests", {
        method: "POST",
        body: formData,
      });

      console.log('📡 Réponse reçue:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Succès:', result);
        
        // Utiliser le code de suivi retourné par l'API ou générer un code de secours
        const trackingCode = result.trackingCode || result.request?.trackingCode || 'EBF_' + Math.floor(1000 + Math.random() * 9000);
        
        // Vérifier si la notification par email a été envoyée avec succès
        if (result.success && result.notification) {
          console.log('📧 Email envoyé avec succès');
          // Rediriger vers la page de confirmation avec le code de suivi
          router.push(`/confirmation?code=${trackingCode}`);
        } else {
          // Vérifier s'il y a une erreur de notification
          if (result.notification && result.notification.error) {
            console.error('❌ Erreur de notification:', result.notification.error);
            setFormError("La demande a été enregistrée mais l'email de notification n'a pas pu être envoyé. Veuillez contacter l'administrateur.");
          } else {
            // Rediriger vers confirmation même si la notification a échoué
            console.log('✅ Demande enregistrée avec succès');
            router.push(`/confirmation?code=${trackingCode}`);
          }
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Erreur API:', errorData);
        setFormError(errorData.error || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      setFormError("Une erreur de réseau est survenue. Veuillez vérifier votre connexion et réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

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
              <h1 className="text-2xl font-bold text-blue-900">Décrivez votre problème ⚡</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="relative z-10 w-full bg-gray-200 h-1">
        <div className="bg-blue-600 h-1 w-3/4 transition-all duration-500"></div>
      </div>

      {/* Main Content */}
      <section className="relative z-10 flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className={`text-center mb-12 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span>Diagnostic GRATUIT à domicile</span>
              </div>
            </div>
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              Dites-nous tout sur votre
              <span className="text-blue-600 animate-pulse"> problème électrique</span>
            </h2>
            <p className="text-sm text-gray-600 max-w-2xl mx-auto">
              Nos experts électriciens sont prêts à intervenir rapidement pour résoudre votre problème.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Input Type Selection */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
              <Card className="overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="mr-3">💬</span>
                    Comment souhaitez-vous décrire votre problème ?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <RadioGroup 
                    value={inputType} 
                    onValueChange={(value) => {
                      setInputType(value as "text" | "audio");
                      if (value === "text") {
                        scrollToTextSection();
                      } else {
                        scrollToAudioSection();
                      }
                    }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="relative">
                      <RadioGroupItem value="text" id="text" className="peer sr-only" />
                      <Label 
                        htmlFor="text" 
                        onClick={() => {
                          setTimeout(scrollToTextSection, 50);
                        }}
                        className="flex flex-col items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 hover:border-blue-300 hover:shadow-md"
                      >
                        <div className="text-3xl mb-2">✍️</div>
                        <span className="font-semibold">Écrire un message</span>
                        <span className="text-sm text-gray-500 mt-1">Décrivez en détail</span>
                      </Label>
                    </div>
                    <div className="relative">
                      <RadioGroupItem value="audio" id="audio" className="peer sr-only" />
                      <Label 
                        htmlFor="audio" 
                        onClick={() => {
                          setTimeout(scrollToAudioSection, 50);
                        }}
                        className="flex flex-col items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all duration-300 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 hover:border-blue-300 hover:shadow-md"
                      >
                        <div className="text-3xl mb-2">🎤</div>
                        <span className="font-semibold">Message vocal</span>
                        <span className="text-sm text-gray-500 mt-1">Parlez-nous</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Text Input */}
            {inputType === "text" && (
              <div ref={textSectionRef} className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                <Card className="border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
                  <CardContent className="pt-6">
                    <Label htmlFor="description" className="text-lg font-semibold text-gray-900 mb-4 block">
                      📝 Décrivez votre problème en détail
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Décrivez précisément votre problème d'électricité, les symptômes observés, quand cela a commencé, etc..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[120px] text-lg p-4 border-2 border-gray-200 focus:border-blue-500 transition-colors resize-none"
                    />
                    <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                      <span>Plus vous êtes précis, mieux nous pourrons vous aider</span>
                      <span>{description.length}/500</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Audio Recording */}
            {inputType === "audio" && (
              <div ref={audioSectionRef} className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                <Card className="border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
                  <CardContent className="pt-6">
                    <Label className="text-lg font-semibold text-gray-900 mb-6 block">
                      🎵 Enregistrez votre message vocal
                    </Label>
                    <div className="text-center space-y-6">
                      <div className="flex justify-center space-x-4">
                        {!isRecording ? (
                          <Button
                            type="button"
                            onClick={startRecording}
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl"
                          >
                            <Mic className="w-6 h-6 mr-2" />
                            Enregistrer
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={stopRecording}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl animate-pulse"
                          >
                            <Square className="w-6 h-6 mr-2" />
                            Arrêter
                          </Button>
                        )}
                        
                        {audioUrl && (
                          <Button
                            type="button"
                            onClick={playAudio}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transform transition-all duration-300 hover:scale-110 hover:shadow-xl"
                          >
                            <Play className="w-6 h-6 mr-2" />
                            Écouter
                          </Button>
                        )}
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-blue-800 font-medium">
                          {isRecording ? "🔴 Enregistrement en cours..." : "⏱️ Durée maximale : 90 secondes"}
                        </p>
                      </div>

                      <div className="text-left">
                        <Label htmlFor="audio-upload" className="text-sm font-medium text-gray-700">
                          📁 Ou importez un fichier audio :
                        </Label>
                        <Input
                          id="audio-upload"
                          type="file"
                          accept="audio/*"
                          onChange={handleFileUpload}
                          className="mt-2"
                        />
                      </div>

                      {audioUrl && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
                          <p className="text-green-800 font-medium">✅ Message vocal enregistré avec succès</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Photo Upload */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
              <Card className="border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
                <CardContent className="pt-6">
                  <Label htmlFor="photo" className="text-lg font-semibold text-gray-900 mb-4 block">
                    📷 Ajouter une photo (optionnel)
                  </Label>
                  
                  {/* Upload Area */}
                  <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${imagePreview ? 'border-green-300 bg-green-50 hover:border-green-400' : 'border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50'}`}>
                    {/* Image Preview Inside Button */}
                    {imagePreview && (
                      <div className="mb-4 animate-fade-in">
                        <div className="relative inline-block group">
                          <img 
                            src={imagePreview} 
                            alt="Aperçu de la photo" 
                            className="w-32 h-32 rounded-lg object-cover mx-auto block transition-transform duration-300 group-hover:scale-105 shadow-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              const photoInput = document.getElementById('photo') as HTMLInputElement;
                              if (photoInput) {
                                photoInput.value = '';
                              }
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100"
                            title="Supprimer l'image"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                    
                    <Upload className={`w-12 h-12 mx-auto mb-4 transition-all duration-300 ${imagePreview ? 'text-green-500' : 'text-gray-400'}`} />
                    <p className={`mb-2 font-medium transition-colors duration-300 ${imagePreview ? 'text-green-700' : 'text-gray-600'}`}>
                      {imagePreview ? '📷 Changer la photo' : '📁 Ajouter une photo'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">Formats supportés : JPG, PNG, GIF (max 5MB)</p>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="mt-2 cursor-pointer transition-all duration-300"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
              <Card className="border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="mr-3">👤</span>
                    Vos coordonnées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-lg font-semibold text-gray-900 mb-2 block">
                        Nom complet <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Votre nom et prénom"
                        required
                        className="text-lg p-4 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-lg font-semibold text-gray-900 mb-2 block">
                        Téléphone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+225 XX XX XX XX XX"
                        required
                        className="text-lg p-4 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="neighborhood" className="text-lg font-semibold text-gray-900 mb-2 block">
                      Quartier
                    </Label>
                    <Input
                      id="neighborhood"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      placeholder="Ex: Zone 4, Air France, etc."
                      className="text-lg p-4 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Position Field - Hidden */}
                  <div className="hidden">
                    <Input
                      id="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Coordonnées GPS"
                      className="text-lg p-4 border-2 border-gray-200 focus:border-blue-500 transition-colors bg-gray-50"
                      readOnly
                    />
                  </div>

                  {/* Geolocation Button */}
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGeolocation}
                      disabled={locationLoading || position !== ""}
                      className="w-full py-4 text-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
                    >
                      <MapPin className="w-6 h-6 mr-2" />
                      {locationLoading ? '🔄 Recherche de votre position...' : position !== "" ? '✅ Position ajoutée' : '📍 Ajouter ma position'}
                    </Button>
                    
                    {/* Instructions */}
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800 font-medium mb-1">💡 Pour ajouter votre position :</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Cliquez sur le bouton ci-dessus</li>
                        <li>• Autorisez l'accès à votre position lorsque demandé</li>
                        <li>• Si vous avez déjà refusé, cliquez sur 🔒 dans la barre d'adresse pour modifier les permissions</li>
                      </ul>
                    </div>
                    
                    {locationSuccess && (
                      <p className="text-sm text-green-600 mt-2 p-3 bg-green-50 rounded-lg">{locationSuccess}</p>
                    )}
                    {locationError && (
                      <p className="text-sm text-red-600 mt-2 p-3 bg-red-50 rounded-lg whitespace-pre-line">{locationError}</p>
                    )}
                    
                    {/* Google Maps Link */}
                    {mapsLink && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-blue-800">🗺️ Votre position sur Google Maps:</p>
                          <button
                            type="button"
                            onClick={() => {
                              setPosition("");
                              setMapsLink("");
                              setLocationSuccess(null);
                              setLocationError(null);
                            }}
                            className="text-xs text-red-600 hover:text-red-800 underline"
                          >
                            Modifier la position
                          </button>
                        </div>
                        <a 
                          href={mapsLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                        >
                          {mapsLink}
                        </a>
                        <p className="text-xs text-blue-600 mt-2">
                          💡 Cliquez sur le lien pour ouvrir Google Maps et voir l'itinéraire
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Authorization */}
            <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
              <Card className="border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Checkbox
                      id="authorization"
                      checked={authorized}
                      onCheckedChange={(checked) => setAuthorized(checked as boolean)}
                      className="mt-1 w-4 h-4"
                    />
                    <div className="flex-1">
                      <Label htmlFor="authorization" className="text-sm font-medium text-gray-900 leading-relaxed">
                        J'autorise EBF Bouaké à me recontacter par téléphone ou WhatsApp pour mon diagnostic gratuit et pour me proposer un devis pour mes problèmes électriques.
                      </Label>
                      <p className="text-xs text-gray-600 mt-1">
                        📞 Nous vous appellerons rapidement pour planifier votre intervention.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error Display */}
            {formError && (
              <div className={`mb-6 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{formError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <Button
                type="submit"
                disabled={isSubmitting || !authorized}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg px-8 py-4 rounded-full font-bold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    Envoyer ma demande 📤
                    <Shield className="w-5 h-5 ml-2 group-hover:rotate-12 transition-transform" />
                  </>
                )}
              </Button>
              
              <p className="mt-4 text-sm text-gray-600">
                🔒 Vos informations sont sécurisées et confidentielles
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* Toast de confirmation de position */}
      {showLocationToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span className="font-medium">Position ajoutée avec succès !</span>
          </div>
        </div>
      )}
    </main>
  );
}
