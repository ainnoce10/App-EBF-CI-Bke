"use client";
import { useState, useRef, useEffect } from "react";

declare global {
  interface Window {
    __gm_map?: any;
    __gm_marker?: any;
    __gm_marker_pos?: { lat: number; lng: number } | null;
    google?: any;
    L?: any;
  }
}
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
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [chosenLatLng, setChosenLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [showLocationToast, setShowLocationToast] = useState(false);
  const [position, setPosition] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const photoFileRef = useRef<File | null>(null);
  const [isAutoSendingAudio, setIsAutoSendingAudio] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const textSectionRef = useRef<HTMLDivElement>(null);
  const audioSectionRef = useRef<HTMLDivElement>(null);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const router = useRouter();

  // Initialize animations
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Query microphone permission state if supported
  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        if (navigator.permissions && (navigator.permissions as any).query) {
          const status = await (navigator.permissions as any).query({ name: 'microphone' });
          if (!mounted) return;
          setMicPermissionState(status.state || 'unknown');
          status.onchange = () => setMicPermissionState(status.state || 'unknown');
        } else {
          setMicPermissionState('unknown');
        }
      } catch (e) {
        setMicPermissionState('unknown');
      }
    };
    check();
    return () => { mounted = false; };
  }, []);

  // Request microphone access and return the MediaStream if granted (or null)
  const requestMicrophoneAccess = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermissionState('granted');
      return stream;
    } catch (err: any) {
      console.error('Permission microphone refusée:', err);
      if (err && err.name === 'NotAllowedError') setMicPermissionState('denied');
      return null;
    }
  };

  // Initialize Google Maps picker when modal opens
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const loadGoogleMaps = (key: string) => new Promise<void>((resolve, reject) => {
      // @ts-ignore
      if (window.google && window.google.maps) return resolve();
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });

    const loadLeaflet = () => new Promise<void>((resolve, reject) => {
      // inject CSS
      if (!document.querySelector('link[data-leaflet]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.setAttribute('data-leaflet', '1');
        document.head.appendChild(link);
      }
      if ((window as any).L && (window as any).L.map) return resolve();
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (e) => reject(e);
      document.head.appendChild(script);
    });

    const initMap = async () => {
      if (!mapCenter) return;
      const el = document.getElementById('map-picker');
      if (!el) return;
      // clear previous
      el.innerHTML = '';

      try {
          if (apiKey) {
          // Try Google Maps first
          await loadGoogleMaps(apiKey);
          // @ts-ignore
          const google = window.google;
          if (!google || !google.maps) throw new Error('Google Maps not available after load');
          // @ts-ignore
          const map = new google.maps.Map(el, { center: { lat: mapCenter.lat, lng: mapCenter.lng }, zoom: 16 });
          // @ts-ignore
          const marker = new google.maps.Marker({ position: { lat: mapCenter.lat, lng: mapCenter.lng }, map, draggable: true });
          // expose map and marker for search/move operations
          // @ts-ignore
          window.__gm_map = map;
          // @ts-ignore
          window.__gm_marker = marker;
          // store marker pos globally for confirm button to read
          // @ts-ignore
          window.__gm_marker_pos = { lat: mapCenter.lat, lng: mapCenter.lng };
          marker.addListener('dragend', () => {
            // @ts-ignore
            const pos = marker.getPosition();
            // @ts-ignore
            window.__gm_marker_pos = { lat: pos.lat(), lng: pos.lng() };
          });
          map.addListener('click', (e: any) => {
            marker.setPosition(e.latLng);
            // @ts-ignore
            window.__gm_marker_pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          });
          setMapLoadError(null);
          return;
        }
      } catch (gErr) {
        console.warn('Google Maps failed, falling back to Leaflet:', gErr);
      }

      // Leaflet / OpenStreetMap fallback (no API key required)
      try {
        await loadLeaflet();
        // @ts-ignore
        const L = (window as any).L;
        // create container div (leaflet expects an empty div)
        const mapDiv = document.createElement('div');
        mapDiv.style.height = '100%';
        mapDiv.style.width = '100%';
        el.appendChild(mapDiv);

        const map = L.map(mapDiv).setView([mapCenter.lat, mapCenter.lng], 16);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        const marker = L.marker([mapCenter.lat, mapCenter.lng], { draggable: true }).addTo(map);
        // expose map and marker for search/move operations
        // @ts-ignore
        window.__gm_map = map;
        // @ts-ignore
        window.__gm_marker = marker;
        // store marker pos globally for confirm button
        // @ts-ignore
        window.__gm_marker_pos = { lat: mapCenter.lat, lng: mapCenter.lng };
        marker.on('dragend', function (e: any) {
          const pos = marker.getLatLng();
          // @ts-ignore
          window.__gm_marker_pos = { lat: pos.lat, lng: pos.lng };
        });
        map.on('click', function (e: any) {
          marker.setLatLng(e.latlng);
          // @ts-ignore
          window.__gm_marker_pos = { lat: e.latlng.lat, lng: e.latlng.lng };
        });
        setMapLoadError(null);
      } catch (leafErr) {
        console.error('Erreur initialisation carte de secours (Leaflet):', leafErr);
        setMapLoadError('Impossible de charger la carte. Vérifiez la connexion.');
      }
    };

    if (showMapModal && mapCenter) {
      initMap();
    }
  }, [showMapModal, mapCenter]);

  // Initialize audio recording
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  const startRecording = async (providedStream?: MediaStream) => {
    try {
      console.log("🎤 Démarrage de l'enregistrement...");
      const stream = providedStream || await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log('✅ Microphone prêt, enregistrement en cours...');
      const mediaRecorder = new MediaRecorder(stream);

      // store stream separately so we can stop tracks reliably later
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        try {
          // determine mime type: prefer recorder mimeType, else infer from first chunk
          const inferredType = (mediaRecorder && (mediaRecorder as any).mimeType) || (audioChunksRef.current[0] && (audioChunksRef.current[0] as Blob).type) || 'audio/webm';
          const audioBlob = new Blob(audioChunksRef.current, { type: inferredType });

          // revoke previous URL if present
          if (audioUrl) {
            try { URL.revokeObjectURL(audioUrl); } catch (e) {}
          }

          const newUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(newUrl);
          setAudioBlob(audioBlob);

          // clear collected chunks for next recording
          audioChunksRef.current = [];

          // stop media tracks and cleanup refs
          try {
            if (mediaStreamRef.current) {
              mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            }
          } catch (e) {
            console.warn('Erreur arrêt pistes après onstop:', e);
          }

          try { mediaRecorderRef.current = null; } catch (e) {}
          try { mediaStreamRef.current = null; } catch (e) {}
          setIsRecording(false);

          // send automatically after recording stops (fire-and-forget)
          try {
            const ext = (audioBlob.type && audioBlob.type.split('/')?.[1]) || 'webm';
            const filename = `recording-${Date.now()}.${ext}`;
            // ensure sendAudioDirect accepts filename-aware blob
            sendAudioDirect(audioBlob);
          } catch (e) {
            console.error('Erreur envoi audio auto:', e);
          }
        } catch (e) {
          console.error('Erreur traitement onstop audio:', e);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setFormError(null);

      // auto-stop after 2 minutes
      const maxMs = 2 * 60 * 1000;
      const stopTimer = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, maxMs);
      // attach timer to recorder for cleanup
      // @ts-ignore
      mediaRecorderRef.current._stopTimer = stopTimer;
    } catch (error: any) {
      console.error('❌ Erreur accès microphone:', error);
      
      let errorMessage = "⏸️ Microphone non disponible. C'est optionnel — vous pouvez continuer par écrit.";

      if (error.name === 'NotAllowedError') {
        errorMessage = "🔒 Microphone refusé. Cliquez sur le 🔒 dans la barre d'adresse, sélectionnez 'Microphone' → 'Autoriser', puis réessayez.";
      } else if (error.name === 'SecurityError') {
        errorMessage = "🔒 Accès microphone bloqué (contexte sécurisé). Vérifiez que le site utilise HTTPS.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = "🎤 Pas de microphone détecté sur votre appareil.";
      } else if (error.name === 'NotReadableError') {
        errorMessage = "⏸️ Microphone inaccessible — redémarrez le navigateur ou votre appareil.";
      } else if (error.name === 'AbortError') {
        errorMessage = "⏸️ Erreur microphone. Essayez à nouveau.";
      }

      console.log('ℹ️', errorMessage);
      setFormError(errorMessage);
    }
  };

  const handleStartClick = async () => {
    // Open a small popup recorder that uses the browser MediaRecorder and posts the resulting audio back.
    try {
      const popup = window.open('', '_blank', 'width=500,height=700');
      if (!popup) {
        setFormError('Impossible d\'ouvrir la fenêtre d\'enregistrement. Autorisez les popups et réessayez.');
        return;
      }

      // HTML recorder (adapted from provided template) - it will post a dataURL to window.opener when done
      const recorderHtml = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Enregistreur Audio</title><style>body{font-family:system-ui,Segoe UI,Roboto,Arial;margin:0;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);min-height:100vh;display:flex;align-items:center;justify-content:center} .recorder-container{background:#fff;border-radius:16px;padding:24px;max-width:420px;width:100%;text-align:center} .record-button{width:96px;height:96px;border-radius:50%;border:none;background:#ff4757;color:#fff;font-size:16px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center} .recording{animation:pulse 1.5s infinite} @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(255,71,87,0.7)}70%{box-shadow:0 0 0 12px rgba(255,71,87,0)}100%{box-shadow:0 0 0 0 rgba(255,71,87,0)}} .timer{margin-top:12px;font-weight:600} .controls{display:flex;gap:8px;justify-content:center;margin-top:12px} button.control-btn{padding:8px 14px;border-radius:999px;border:none;background:#667eea;color:#fff} .status{margin-top:10px;padding:8px;border-radius:8px}</style></head><body><div class="recorder-container"><h2>Enregistreur</h2><button id="recordButton" class="record-button"><span id="buttonText">Commencer</span></button><div id="timer" class="timer">00:00</div><audio id="audioPlayer" controls style="display:none;margin-top:12px;width:100%"></audio><div class="controls"><button id="downloadButton" class="control-btn" disabled>Télécharger</button><button id="clearButton" class="control-btn" disabled>Effacer</button></div><div id="status" class="status" style="display:none"></div></div><script>(() => {let mediaRecorder=null;let audioChunks=[];let audioBlob=null;let audioUrl=null;let startTime=0;let timerInterval=null;let isRecording=false;const recordButton=document.getElementById('recordButton');const buttonText=document.getElementById('buttonText');const timer=document.getElementById('timer');const audioPlayer=document.getElementById('audioPlayer');const downloadButton=document.getElementById('downloadButton');const clearButton=document.getElementById('clearButton');const status=document.getElementById('status');function showStatus(msg){status.textContent=msg;status.style.display='block';}function updateTimer(){timerInterval=setInterval(()=>{const elapsed=Date.now()-startTime;const m=Math.floor(elapsed/60000);const s=Math.floor((elapsed%60000)/1000);timer.textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');},1000);}recordButton.addEventListener('click',async()=>{if(isRecording){stopRecording();}else{startRecording();}});downloadButton.addEventListener('click',()=>{if(!audioBlob)return;const a=document.createElement('a');a.href=audioUrl;a.download='enregistrement_'+new Date().toISOString().slice(0,19).replace(/:/g,'-')+'.wav';document.body.appendChild(a);a.click();document.body.removeChild(a);showStatus('Téléchargement démarré');});clearButton.addEventListener('click',()=>{audioBlob=null;audioUrl=null;audioPlayer.src='';audioPlayer.style.display='none';downloadButton.disabled=true;clearButton.disabled=true;timer.textContent='00:00';showStatus('Enregistrement effacé');});async function startRecording(){try{showStatus('Demande d\'accès au microphone...');const stream=await navigator.mediaDevices.getUserMedia({audio:true});mediaRecorder=new MediaRecorder(stream);audioChunks=[];mediaRecorder.ondataavailable=(e)=>{if(e.data&&e.data.size>0)audioChunks.push(e.data)};mediaRecorder.onstop=async()=>{try{audioBlob=new Blob(audioChunks,{type:'audio/wav'});audioUrl=URL.createObjectURL(audioBlob);audioPlayer.src=audioUrl;audioPlayer.style.display='block';downloadButton.disabled=false;clearButton.disabled=false;showStatus('Enregistrement terminé'); // post the recording to opener as dataURL
const fr=new FileReader();fr.onloadend=()=>{try{const dataUrl=fr.result; if(window.opener){window.opener.postMessage({type:'audio-recording', dataUrl: dataUrl, filename: 'recording_'+Date.now()+'.wav'}, '*');} }catch(e){} };fr.readAsDataURL(audioBlob);}catch(err){console.error('onstop err',err)} };mediaRecorder.start();isRecording=true;startTime=Date.now();updateTimer();recordButton.classList.add('recording');buttonText.textContent='Arrêter';showStatus('Enregistrement en cours...');}catch(err){console.error('err',err);showStatus('Erreur: impossible d\'accéder au microphone');}}function stopRecording(){if(mediaRecorder&&mediaRecorder.state!=='inactive'){mediaRecorder.stop();try{mediaRecorder.stream.getTracks().forEach(t=>t.stop());}catch(e){}isRecording=false;clearInterval(timerInterval);recordButton.classList.remove('recording');buttonText.textContent='Commencer';}}window.addEventListener('beforeunload',()=>{try{if(mediaRecorder&&mediaRecorder.state==='recording')mediaRecorder.stop();}catch(e){} });})();</script></body></html>`;

      popup.document.open();
      popup.document.write(recorderHtml);
      popup.document.close();

      // Listen for message from popup with the recorded audio dataURL
      const handleMessage = (ev: MessageEvent) => {
        try {
          if (!ev.data || ev.data.type !== 'audio-recording') return;
          const dataUrl: string = ev.data.dataUrl;
          // convert dataURL to Blob
          const arr = dataUrl.split(',');
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'audio/wav';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const blob = new Blob([u8arr], { type: mime });
          const url = URL.createObjectURL(blob);
          setAudioBlob(blob);
          setAudioUrl(url);
          setFormError(null);
          setLocationSuccess('✅ Message vocal enregistré et prêt à être envoyé');
          setShowLocationToast(true);
          setTimeout(() => setShowLocationToast(false), 3000);
          try { popup.close(); } catch(e) {}
          window.removeEventListener('message', handleMessage);
        } catch (err) {
          console.error('Erreur traitement message popup recorder:', err);
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (err) {
      console.error('Erreur lors de l\'ouverture du recorder popup:', err);
      setFormError("Impossible d'ouvrir l'enregistreur. Essayez d'autoriser les popups ou mettez à jour votre navigateur.");
    }
  };

  // Confirm position chosen on the map
  const confirmMapPosition = (lat: number, lng: number) => {
    const coordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
    setPosition(coordinates);
    setMapsLink(googleMapsLink);
    setChosenLatLng({ lat, lng });
    setShowMapModal(false);
    setLocationSuccess('✅ Position sélectionnée');
    setShowLocationToast(true);
    setTimeout(() => setShowLocationToast(false), 3000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      // clear auto-stop timer if present
      // @ts-ignore
      if (mediaRecorderRef.current._stopTimer) {
        try { 
          // @ts-ignore
          clearTimeout(mediaRecorderRef.current._stopTimer);
        } catch(e) {}
      }
      mediaRecorderRef.current.stop();
      // stop the original media stream tracks if we have them
      try {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
      } catch (e) {
        console.warn('Erreur arrêt des pistes média:', e);
      }
      // cleanup refs
      try { mediaRecorderRef.current = null; } catch(e) {}
      try { mediaStreamRef.current = null; } catch(e) {}
      setIsRecording(false);
    }
  };

  // Focus search input when map modal opens
  useEffect(() => {
    if (showMapModal) {
      setTimeout(() => {
        const el = document.getElementById('map-search') as HTMLInputElement | null;
        if (el) el.focus();
      }, 120);
    }
  }, [showMapModal]);

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

  // Fallback when getUserMedia is not available or denied: allow mobile OS audio capture via file input
  const handleAudioFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setAudioBlob(file);
      setFormError(null);
      console.log('📥 Audio fallback file selected:', file.name, file.size, file.type);
    }
  };

  // Send audio immediately after recording stopped (audioBlob must be set)
  const sendAudioDirect = async (blob: Blob) => {
    try {
      setIsAutoSendingAudio(true);
      const formData = new FormData();
      // minimal metadata - allow anonymous audio
      formData.append('name', 'Message vocal');
      formData.append('phone', '');
      formData.append('neighborhood', '');
      formData.append('position', '');
      formData.append('inputType', 'audio');
      // choose filename extension from blob type
      const ext = (blob.type && blob.type.split('/')?.[1]) || 'webm';
      const filename = `recording-${Date.now()}.${ext}`;
      formData.append('audio', blob, filename);

      const res = await fetch('/api/requests', { method: 'POST', body: formData });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        console.log('✅ Enregistrement vocal envoyé automatiquement', json);
        // show feedback
        setLocationSuccess('✅ Message vocal envoyé au support.');
        setShowLocationToast(true);
        setTimeout(() => setShowLocationToast(false), 3000);
      } else {
        console.error('❌ Envoi vocal automatique échoué', json);
        setFormError("L'envoi automatique du message vocal a échoué.");
      }
    } catch (err) {
      console.error('❌ Erreur envoi vocal automatique', err);
      setFormError("Erreur lors de l'envoi du message vocal.");
    } finally {
      setIsAutoSendingAudio(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("❌ L'image est trop volumineuse. La taille maximale est de 5MB. Réduisez la résolution ou compressez l'image et réessayez.");
        return;
      }

      // Accept any image/* MIME (incl. HEIC/HEIF from mobiles). We'll forward to server and let server/logs decide.
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      photoFileRef.current = file;
      console.log('📥 Image selected:', file.name, file.size, file.type, 'from', event.target.id);
      
      // Feedback visuel de succès
      const uploadArea = event.target.closest('.border-dashed');
      if (uploadArea) {
        uploadArea.classList.add('animate-pulse');
        setTimeout(() => {
          uploadArea.classList.remove('animate-pulse');
        }, 1000);
      }
    } else if (file && !file.type.startsWith("image/")) {
      alert("❌ Veuillez sélectionner un fichier image valide (JPG/PNG/GIF/HEIC...).");
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
    // Open the interactive map modal to let user pick a position
    setLocationError(null);
    setLocationSuccess(null);
    setLocationLoading(true);

    // Try to center map on user's location first, then open modal
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationLoading(false);
          setShowMapModal(true);
        },
        () => {
          // fallback center
          setMapCenter({ lat: 6.8276, lng: -5.2893 });
          setLocationLoading(false);
          setShowMapModal(true);
        },
        { timeout: 5000 }
      );
    } else {
      setMapCenter({ lat: 6.8276, lng: -5.2893 });
      setLocationLoading(false);
      setShowMapModal(true);
    }
  };

  // Search handler: use Google Geocoder if available, otherwise Nominatim (OpenStreetMap)
  const handleMapSearch = async (query: string) => {
    if (!query || !query.trim()) return;
    setSearchQuery(query);
    try {
      // If google maps loaded, use Geocoder
      // @ts-ignore
      if (window.google && window.google.maps && window.google.maps.Geocoder) {
        // @ts-ignore
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: query }, (results: any) => {
          if (results && results[0] && results[0].geometry && results[0].geometry.location) {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();
            // move marker and center map
            try {
              // @ts-ignore
              if (window.__gm_map && window.__gm_map.setCenter) {
                // @ts-ignore
                window.__gm_map.setCenter({ lat, lng });
              }
              // @ts-ignore
              if (window.__gm_marker && window.__gm_marker.setPosition) {
                // @ts-ignore
                window.__gm_marker.setPosition({ lat, lng });
              }
              // @ts-ignore
              window.__gm_marker_pos = { lat, lng };
            } catch (e) {}
          }
        });
        return;
      }

      // Fallback to Nominatim
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
      const resp = await fetch(url);
      const items = await resp.json();
      if (items && items[0]) {
        const lat = parseFloat(items[0].lat);
        const lng = parseFloat(items[0].lon);
        try {
          // @ts-ignore
          const L = window.L;
          if (L && window.__gm_map && window.__gm_map.setView) {
            // @ts-ignore
            window.__gm_map.setView([lat, lng], 16);
            // @ts-ignore
            if (window.__gm_marker && window.__gm_marker.setLatLng) window.__gm_marker.setLatLng([lat, lng]);
          }
          // @ts-ignore
          window.__gm_marker_pos = { lat, lng };
        } catch (e) {}
      }
    } catch (err) {
      console.error('Erreur geocoding:', err);
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

    // Valider que l'audio a bien été enregistré si mode audio
    if (inputType === "audio" && !audioBlob) {
      setFormError("Veuillez enregistrer un message vocal ou passer en mode texte");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('📤 Envoi de la demande...');
      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("neighborhood", neighborhood);
      formData.append("position", position);
      if (mapsLink) formData.append('mapsLink', mapsLink);
      formData.append("inputType", inputType);
      
      if (inputType === "text") {
        formData.append("description", description);
      } else if (inputType === "audio" && audioBlob) {
        // Ensure audio blob is properly added
        console.log('🎵 Ajout du message audio:', audioBlob.type, audioBlob.size, 'bytes');
        formData.append("audio", audioBlob, "recording.wav");
      }

      // Ajouter la photo si elle existe
      // Prefer explicit ref stored when the user selected an image; fallback to DOM inputs
      const photoInput = document.getElementById('photo') as HTMLInputElement | null;
      const cameraInput = document.getElementById('photo-camera') as HTMLInputElement | null;
      const domFile = (photoInput && photoInput.files && photoInput.files[0]) || (cameraInput && cameraInput.files && cameraInput.files[0]);
      const chosenFile = photoFileRef.current || domFile || null;
      if (chosenFile) console.log('📷 Photo ready to append:', chosenFile.name, chosenFile.size, chosenFile.type);
      if (chosenFile) {
        console.log('📷 Ajout de la photo:', chosenFile.name);
        formData.append("photo", chosenFile);
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
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch (e) {
          try {
            errorData = { error: await response.text() };
          } catch (e2) {
            errorData = { error: 'Erreur serveur inconnue' };
          }
        }
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
                            onClick={handleStartClick}
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
                          {isRecording ? "🔴 Enregistrement en cours..." : "⏱️ Durée maximale : 120 secondes (2 minutes)"}
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
                          <div className="mt-2">
                            <input id="audio-upload-fallback" name="audio" type="file" accept="audio/*" capture onChange={handleAudioFileFallback} className="hidden" />
                            {micPermissionState === 'denied' && (
                              <button type="button" onClick={() => { const el = document.getElementById('audio-upload-fallback') as HTMLInputElement | null; if (el) el.click(); }} className="mt-3 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded text-sm">Enregistrer via l'appareil (fallback)</button>
                            )}
                          </div>
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
                                  const photoInput = document.getElementById('photo') as HTMLInputElement | null;
                                  const cameraInput = document.getElementById('photo-camera') as HTMLInputElement | null;
                                  if (photoInput) photoInput.value = '';
                                  if (cameraInput) cameraInput.value = '';
                                  photoFileRef.current = null;
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
                    <p className="text-sm text-gray-500 mb-4">Formats supportés : JPG, PNG, GIF, HEIC, WEBP (max 5MB). Sur mobile vous pouvez utiliser l'appareil photo.</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          type="button"
                          onClick={() => { const el = document.getElementById('photo-camera') as HTMLInputElement | null; if (el) el.click(); }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                          Prendre une photo
                        </button>
                        <button
                          type="button"
                          onClick={() => { const el = document.getElementById('photo') as HTMLInputElement | null; if (el) el.click(); }}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded border"
                        >
                          Choisir depuis la galerie
                        </button>
                      </div>

                      {/* Hidden inputs: one triggers camera, the other opens gallery for existing photos */}
                      <input id="photo-camera" name="photo" type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                      <input id="photo" name="photo" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </div>
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

                  {/* Manual Position Input - Fallback */}
                  {position === "" && (
                    <div>
                      <Label htmlFor="manual-position" className="text-sm font-medium text-gray-700 mb-2 block">
                        💡 Ou saisissez manuellement vos coordonnées (optionnel) :
                      </Label>
                      <Input
                        id="manual-position"
                        placeholder="Ex: 6.8276, -5.2893"
                        onBlur={(e) => {
                          const value = e.target.value.trim();
                          if (value && value.includes(',')) {
                            const coords = value.split(',');
                            if (coords.length === 2) {
                              const lat = parseFloat(coords[0].trim());
                              const lng = parseFloat(coords[1].trim());
                              if (!isNaN(lat) && !isNaN(lng)) {
                                confirmMapPosition(lat, lng);
                              }
                            }
                          }
                        }}
                        className="text-sm p-3 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  )}

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
                    {/* Guide removed per request - map modal provides guidance now */}
                    
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
                    {/* Map Picker Modal */}
                    {showMapModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="w-full max-w-3xl mx-4 bg-white rounded-lg overflow-hidden shadow-xl">
                                          <div className="flex items-center justify-between p-3 border-b">
                                            <h3 className="font-bold">Choisissez votre position sur la carte</h3>
                                            <div className="flex items-center space-x-2">
                                              <input
                                                id="map-search"
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleMapSearch(searchQuery); } }}
                                                placeholder="Rechercher une adresse ou un lieu"
                                                className="text-sm p-2 border rounded w-64"
                                              />
                                              <button type="button" onClick={() => handleMapSearch(searchQuery)} className="text-sm bg-blue-600 text-white px-3 py-2 rounded">Rechercher</button>
                                              <button type="button" onClick={() => setShowMapModal(false)} className="text-sm text-gray-600 hover:text-gray-900">Annuler</button>
                                            </div>
                                          </div>
                          <div>
                            {mapLoadError ? (
                              <div className="p-6 text-center text-sm text-red-600">
                                <p>{mapLoadError}</p>
                                <p className="mt-2 text-xs text-gray-500">Vous pouvez toujours saisir manuellement votre position si nécessaire.</p>
                              </div>
                            ) : (
                              <div id="map-picker" style={{ height: 420 }}>
                                {/* Map will mount here */}
                              </div>
                            )}
                          </div>
                          <div className="p-3 flex items-center justify-end space-x-2 border-t">
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  // read marker position
                                  // @ts-ignore
                                  const markerPos = window.__gm_marker_pos;
                                  if (markerPos && markerPos.lat && markerPos.lng) {
                                    confirmMapPosition(markerPos.lat, markerPos.lng);
                                  } else if (mapCenter) {
                                    confirmMapPosition(mapCenter.lat, mapCenter.lng);
                                  }
                                } catch (e) {
                                  console.error('Erreur lecture position carte', e);
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                            >
                              Confirmer la position
                            </button>
                          </div>
                        </div>
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
