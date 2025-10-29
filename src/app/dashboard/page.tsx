"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Play, Plus, Eye, Search, MessageCircle, Zap, Shield, Star, Clock, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import NotificationSystem from "@/components/notification-system";
import QuickMessageModal from "@/components/quick-message-modal";
import { useNotificationSound } from "@/hooks/use-notification-sound";

interface Request {
  id: string;
  customer: {
    name: string | null;
    phone: string;
    neighborhood: string | null;
  };
  type: 'TEXT' | 'AUDIO';
  status: 'NEW' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  technician?: {
    id: string;
    name: string;
  };
  audioUrl?: string;
  transcription?: string;
  photoUrl?: string;
  scheduledDate?: string;
  notes?: string;
  description?: string;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
}

interface Message {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  content: string;
  type: 'CONTACT' | 'REQUEST' | 'COMPLAINT' | 'INFO';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'UNREAD' | 'READ' | 'ANSWERED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [technicianFilter, setTechnicianFilter] = useState<string>("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { playSound } = useNotificationSound();
  const [editForm, setEditForm] = useState({
    status: '',
    technicianId: '',
    scheduledDate: '',
    notes: ''
  });

  useEffect(() => {
    setIsVisible(true);
    fetchRequests();
    fetchTechnicians();
    fetchMessages();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, technicianFilter, searchTerm]);

  // Écouter les nouveaux messages
  useEffect(() => {
    const handleNewMessage = (event: any) => {
      const message = event.detail;
      setMessages(prev => [message, ...prev]);
      playSound(); // Jouer le son de notification
    };

    window.addEventListener('newMessage', handleNewMessage);
    return () => window.removeEventListener('newMessage', handleNewMessage);
  }, [playSound]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const mockTechnicians: Technician[] = [
        { id: '1', name: 'Kouassi Jean', phone: '+225 01 23 45 67 89', isActive: true },
        { id: '2', name: 'Touré Mohamed', phone: '+225 02 34 56 78 90', isActive: true },
        { id: '3', name: 'Diabaté Marie', phone: '+225 03 45 67 89 01', isActive: true },
      ];
      setTechnicians(mockTechnicians);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    if (technicianFilter !== 'all') {
      filtered = filtered.filter(req => req.technician?.id === technicianFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.customer.phone.includes(searchTerm) ||
        req.customer.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-red-100 text-red-800 border-red-200';
      case 'PLANNED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NEW': return '🔴';
      case 'PLANNED': return '🟡';
      case 'IN_PROGRESS': return '🔵';
      case 'COMPLETED': return '🟢';
      case 'CANCELLED': return '⚫';
      default: return '⚪';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'NEW': return 'Nouveau';
      case 'PLANNED': return 'Planifié';
      case 'IN_PROGRESS': return 'En cours';
      case 'COMPLETED': return 'Terminé';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'TEXT' ? '✉️ Texte' : '🎵 Audio';
  };

  const openRequestDetail = (request: Request) => {
    setSelectedRequest(request);
    setEditForm({
      status: request.status,
      technicianId: request.technician?.id || '',
      scheduledDate: request.scheduledDate ? new Date(request.scheduledDate).toISOString().split('T')[0] : '',
      notes: request.notes || ''
    });
    setIsDetailModalOpen(true);
    setIsEditing(false);
  };

  const handleSaveRequest = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        await fetchRequests();
        setIsEditing(false);
        const updatedRequest = await response.json();
        setSelectedRequest(updatedRequest);
      }
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  

  const getRequestStats = () => {
    const stats = {
      new: requests.filter(r => r.status === 'NEW').length,
      planned: requests.filter(r => r.status === 'PLANNED').length,
      inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
      completed: requests.filter(r => r.status === 'COMPLETED').length,
      cancelled: requests.filter(r => r.status === 'CANCELLED').length,
      total: requests.length
    };
    return stats;
  };

  // Fonctions de gestion des messages
  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setIsMessageModalOpen(true);
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'READ' }),
      });

      if (response.ok) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, status: 'READ' } : msg
          )
        );
        fetchMessages(); // Rafraîchir la liste
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadMessages = messages.filter(m => m.status === 'UNREAD');
      for (const message of unreadMessages) {
        await handleMarkAsRead(message.id);
      }
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };

  const handleReplyToMessage = (messageId: string) => {
    // Rediriger vers la page des messages avec le message sélectionné
    window.location.href = `/messages?id=${messageId}`;
  };

  const stats = getRequestStats();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full bg-white/90 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12 group">
                <Image
                  src="/ebf-logo-new.jpg"
                  alt="EBF Bouaké Logo"
                  fill
                  className="object-contain transform group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-blue-600 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord EBF</h1>
                <p className="text-sm text-gray-600">Espace de gestion des interventions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationSystem
                messages={messages}
                onMessageClick={handleMessageClick}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>En ligne</span>
              </div>
              <Link href="/">
                <Button variant="outline" className="hover:scale-105 transition-transform">
                  Voir le site client
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className={`mb-8 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Bienvenue dans votre espace</h2>
              <p className="text-gray-600 mt-2">Gérez toutes vos interventions électriques depuis un seul endroit</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div className="text-sm text-gray-500">Dernière synchronisation: {new Date().toLocaleTimeString('fr-FR')}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[
            { title: "Total", value: stats.total, color: "bg-blue-500", icon: "📊", trend: "+12%" },
            { title: "Nouvelles", value: stats.new, color: "bg-red-500", icon: "🔴", trend: "Urgent" },
            { title: "Planifiées", value: stats.planned, color: "bg-yellow-500", icon: "🟡", trend: "En attente" },
            { title: "En cours", value: stats.inProgress, color: "bg-blue-500", icon: "🔵", trend: "Actif" },
            { title: "Terminées", value: stats.completed, color: "bg-green-500", icon: "🟢", trend: "+8%" }
          ].map((stat, index) => (
            <Card 
              key={index}
              className={`transform transition-all duration-500 hover:scale-105 hover:shadow-lg border-0 shadow-md ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center text-white text-xl`}>
                    {stat.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase tracking-wide">{stat.trend}</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-600">{stat.title}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Phone className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Urgence 24/7</h3>
              <p className="text-red-100 mb-4">Appelez directement pour les urgences</p>
              <a href="tel:+2252731964604" className="inline-block bg-white text-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-50 transition-colors">
                +225 27 31 96 46 04
              </a>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Messagerie</h3>
              <p className="text-green-100 mb-4">Consultez tous vos messages</p>
              <Link href="/messages" className="inline-block bg-white text-green-600 px-6 py-2 rounded-full font-bold hover:bg-green-50 transition-colors">
                Voir les messages
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <Plus className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Nouvelle intervention</h3>
              <p className="text-blue-100 mb-4">Créez manuellement une demande</p>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 font-bold">
                Créer une demande
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 border-2 border-gray-200 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Rechercher par nom, téléphone ou quartier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Label className="font-medium text-gray-700">Statut:</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 border-2 border-gray-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">📋 Tous</SelectItem>
                      <SelectItem value="NEW">🔴 Nouveau</SelectItem>
                      <SelectItem value="PLANNED">🟡 Planifié</SelectItem>
                      <SelectItem value="IN_PROGRESS">🔵 En cours</SelectItem>
                      <SelectItem value="COMPLETED">🟢 Terminé</SelectItem>
                      <SelectItem value="CANCELLED">⚫ Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Label className="font-medium text-gray-700">Technicien:</Label>
                  <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                    <SelectTrigger className="w-40 border-2 border-gray-200 focus:border-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">👥 Tous</SelectItem>
                      {technicians.map(tech => (
                        <SelectItem key={tech.id} value={tech.id}>
                          🔧 {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {stats.new > 0 && (
                <div className="flex items-center space-x-2 bg-red-50 border border-red-200 px-4 py-2 rounded-full">
                  <MessageCircle className="w-4 h-4 text-red-600 animate-pulse" />
                  <span className="text-sm font-medium text-red-800">
                    {stats.new} nouvelle{stats.new > 1 ? 's' : ''} demande{stats.new > 1 ? 's' : ''} urgente{stats.new > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card className="border-2 border-gray-200 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                <span className="mr-3">📋</span>
                Liste des demandes clients
              </CardTitle>
              <div className="text-sm text-gray-600">
                {filteredRequests.length} demande{filteredRequests.length > 1 ? 's' : ''} trouvée{filteredRequests.length > 1 ? 's' : ''}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-bold text-gray-700">#</TableHead>
                    <TableHead className="font-bold text-gray-700">Client</TableHead>
                    <TableHead className="font-bold text-gray-700">Contact</TableHead>
                    <TableHead className="font-bold text-gray-700">Quartier</TableHead>
                    <TableHead className="font-bold text-gray-700">Type</TableHead>
                    <TableHead className="font-bold text-gray-700">Statut</TableHead>
                    <TableHead className="font-bold text-gray-700">Date</TableHead>
                    <TableHead className="font-bold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request, index) => (
                    <TableRow 
                      key={request.id} 
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <TableCell className="font-medium text-gray-900">
                        #{index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">
                              {request.customer.name ? request.customer.name.charAt(0).toUpperCase() : 'A'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {request.customer.name || 'Client anonyme'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {request.id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">{request.customer.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {request.customer.neighborhood || 'Non spécifié'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {getTypeLabel(request.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(request.status)} font-medium border`}>
                          <span className="mr-2">{getStatusIcon(request.status)}</span>
                          {getStatusLabel(request.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {format(new Date(request.createdAt), 'dd/MM/yyyy', { locale: fr })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(request.createdAt), 'HH:mm', { locale: fr })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRequestDetail(request)}
                            className="hover:scale-105 transition-transform"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {request.status === 'NEW' && (
                            <Button
                              size="sm"
                              onClick={() => openRequestDetail(request)}
                              className="bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 transition-transform"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredRequests.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune demande trouvée</h3>
                <p className="text-gray-600">Essayez de modifier vos filtres de recherche</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Request Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="bg-gradient-to-r from-blue-50 to-blue-100 -m-6 mb-6 p-6 rounded-t-xl">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Détails de la demande #{selectedRequest?.id.slice(-6)}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <span className="mr-2">👤</span>
                      Informations client
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Nom</Label>
                      <p className="text-lg font-semibold">{selectedRequest.customer.name || 'Client anonyme'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Téléphone</Label>
                      <p className="text-lg font-semibold">{selectedRequest.customer.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Quartier</Label>
                      <p className="text-lg font-semibold">{selectedRequest.customer.neighborhood || 'Non spécifié'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <span className="mr-2">📋</span>
                      Détails de la demande
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Type</Label>
                      <p className="text-lg font-semibold">{getTypeLabel(selectedRequest.type)}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Statut</Label>
                      <Badge className={`${getStatusColor(selectedRequest.status)} font-medium border`}>
                        <span className="mr-2">{getStatusIcon(selectedRequest.status)}</span>
                        {getStatusLabel(selectedRequest.status)}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Date de création</Label>
                      <p className="text-lg font-semibold">
                        {format(new Date(selectedRequest.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Request Description */}
              {selectedRequest.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <span className="mr-2">📝</span>
                      Description du problème
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {selectedRequest.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Audio Section */}
              {selectedRequest.audioUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <span className="mr-2">🎵</span>
                      Message vocal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Button
                        onClick={() => playAudio(selectedRequest.audioUrl!)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Écouter le message
                      </Button>
                      <audio src={selectedRequest.audioUrl} controls className="flex-1" />
                    </div>
                    {selectedRequest.transcription && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium text-gray-600 mb-2 block">Transcription</Label>
                        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                          {selectedRequest.transcription}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Photo Section */}
              {selectedRequest.photoUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <span className="mr-2">📷</span>
                      Photo jointe
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src={selectedRequest.photoUrl} 
                      alt="Photo du problème" 
                      className="max-w-full h-auto rounded-lg shadow-md"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Edit Form */}
              {isEditing ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <span className="mr-2">✏️</span>
                      Modifier la demande
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="status">Statut</Label>
                        <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEW">🔴 Nouveau</SelectItem>
                            <SelectItem value="PLANNED">🟡 Planifié</SelectItem>
                            <SelectItem value="IN_PROGRESS">🔵 En cours</SelectItem>
                            <SelectItem value="COMPLETED">🟢 Terminé</SelectItem>
                            <SelectItem value="CANCELLED">⚫ Annulé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="technician">Technicien</Label>
                        <Select value={editForm.technicianId} onValueChange={(value) => setEditForm({...editForm, technicianId: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Non assigné</SelectItem>
                            {technicians.map(tech => (
                              <SelectItem key={tech.id} value={tech.id}>
                                🔧 {tech.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="scheduledDate">Date prévue</Label>
                      <Input
                        id="scheduledDate"
                        type="date"
                        value={editForm.scheduledDate}
                        onChange={(e) => setEditForm({...editForm, scheduledDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={editForm.notes}
                        onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveRequest} className="bg-blue-600 hover:bg-blue-700">
                        Sauvegarder
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Annuler
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex justify-end space-x-2">
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    ✏️ Modifier
                  </Button>
  
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal rapide pour les messages */}
      <QuickMessageModal
        message={selectedMessage}
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        onMarkAsRead={handleMarkAsRead}
        onReply={handleReplyToMessage}
      />
    </main>
  );
}