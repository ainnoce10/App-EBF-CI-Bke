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

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const b = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(b);
        setAudioUrl(URL.createObjectURL(b));
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone inaccessible', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
    }
  };

  const playAudio = () => { if (audioUrl) new Audio(audioUrl).play(); };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('image/')) { alert('Fichier non-image'); return; }
    if (f.size > 5 * 1024 * 1024) { alert('Max 5MB'); return; }
    setImagePreview(URL.createObjectURL(f));
  };

  const handleGeolocation = async () => {
    if (!navigator.geolocation) return setLocationError('Géoloc non supportée');
    setLocationLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 }));
      const { latitude, longitude } = pos.coords;
      setPosition(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      setMapsLink(`https://www.google.com/maps?q=${latitude},${longitude}`);
      setLocationSuccess('✅ Position ajoutée avec succès !');
      setShowLocationToast(true);
      setTimeout(() => setShowLocationToast(false), 3000);
    } catch (err: any) {
      setLocationError('Position non disponible.');
    } finally { setLocationLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) return setFormError('Veuillez fournir votre nom');
    if (!phone.trim()) return setFormError('Veuillez fournir votre numéro de téléphone');
    if (!authorized) return setFormError("Veuillez autoriser EBF à vous recontacter");

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('neighborhood', neighborhood);
      formData.append('position', position);
      formData.append('inputType', inputType);
      if (inputType === 'text') formData.append('description', description);
      if (audioBlob) formData.append('audio', audioBlob, 'recording.wav');
      const photo = document.getElementById('photo') as HTMLInputElement | null;
      if (photo?.files?.[0]) formData.append('photo', photo.files[0]);

      const res = await fetch('/api/requests', { method: 'POST', body: formData });
      if (res.ok) {
        const result = await res.json();
        const tracking = result.trackingCode || 'EBF_' + Math.floor(1000 + Math.random() * 9000);
        router.push(`/confirmation?code=${tracking}`);
      } else {
        const data = await res.json();
        setFormError(data.error || 'Erreur serveur');
      }
    } catch (err) {
      setFormError('Erreur réseau');
    } finally { setIsSubmitting(false); }
  };

  return (
    <main className="min-h-screen">
      <form onSubmit={handleSubmit}>
        {/* minimal UI for verification */}
        <input id="name" value={name} onChange={e => setName(e.target.value)} />
        <input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <button type="button" onClick={handleGeolocation}>Add Position</button>
        <button type="button" onClick={startRecording}>{isRecording ? 'Stop' : 'Record'}</button>
        <button type="submit">Send</button>
      </form>
      {showLocationToast && <div>Position ajoutée !</div>}
    </main>
  );
}
