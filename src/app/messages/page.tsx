"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  User, 
  Clock, 
  Search, 
  Filter,
  Check,
  Archive,
  Trash2,
  Eye,
  AlertCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  PlayCircle,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  type: 'REQUEST' | 'CONTACT' | 'REVIEW' | 'SYSTEM';
  senderName: string;
  senderPhone: string;
  senderEmail?: string;
  subject: string;
  content: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'URGENT';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  audioUrl?: string;
  photoUrl?: string;
  createdAt: string;
  request?: {
    id: string;
    status: string;
    customer: {
      name: string;
      phone: string;
      neighborhood?: string;
    };
  };
}

interface MessageStats {
  total: number;
  unread: number;
  read: number;
  archived: number;
  inProgress: number;
  completed: number;
  urgent: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
    }, 500); // 500ms de délai

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Charger les messages
  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      if (debouncedSearchTerm) {
        setSearching(true);
      }
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);

      const response = await fetch(`/api/messages?${params}`);
      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
        setTotalPages(data.pagination.pages);
        
        // Feedback pour la recherche
        if (debouncedSearchTerm) {
          toast.success(`${data.messages.length} message(s) trouvé(s) pour "${debouncedSearchTerm}"`);
        }
      } else {
        toast.error('Erreur lors du chargement des messages');
      }
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [currentPage, statusFilter, typeFilter, priorityFilter, debouncedSearchTerm]);

  // Charger les statistiques
  const loadStats = async () => {
    try {
      const response = await fetch('/api/messages/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    loadStats();
  }, [statusFilter, typeFilter, priorityFilter]); // Recharger les stats seulement quand les filtres changent

  // Effacer la recherche
  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCurrentPage(1);
  };

  // Marquer comme lu
  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAsRead' }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Donner un feedback à l'utilisateur
          toast.success('Message marqué comme lu');
          // Recharger les messages et les statistiques
          await loadMessages();
          await loadStats();
        } else {
          toast.error('Erreur: ' + (result.error || 'Erreur inconnue'));
        }
      } else {
        toast.error('Erreur lors de la mise à jour du message');
      }
    } catch (error) {
      console.error("Erreur lors du marquage comme lu:", error);
      toast.error('Erreur de connexion');
    }
  };

  // Archiver un message
  const archiveMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      });

      if (response.ok) {
        loadMessages();
        loadStats();
      }
    } catch (error) {
      console.error("Erreur lors de l'archivage:", error);
    }
  };

  // Supprimer un message
  const deleteMessage = async (messageId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadMessages();
        loadStats();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Actions groupées
  const handleBatchAction = async (action: 'markAsRead' | 'archive') => {
    if (selectedMessages.length === 0) return;

    try {
      const response = await fetch('/api/messages/batch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageIds: selectedMessages,
          action,
        }),
      });

      if (response.ok) {
        setSelectedMessages([]);
        loadMessages();
        loadStats();
      }
    } catch (error) {
      console.error("Erreur lors de l'action groupée:", error);
    }
  };

  // Mettre à jour le statut de plusieurs messages
  const handleBatchStatusUpdate = async (status: string) => {
    if (selectedMessages.length === 0) return;

    try {
      const response = await fetch('/api/messages/batch', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageIds: selectedMessages,
          action: 'updateStatus',
          status,
        }),
      });

      if (response.ok) {
        setSelectedMessages([]);
        loadMessages();
        loadStats();
        toast.success(`${selectedMessages.length} message(s) mis à jour avec le statut: ${status}`);
      } else {
        toast.error('Erreur lors de la mise à jour des messages');
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour groupée:", error);
      toast.error('Erreur de connexion');
    }
  };

  // Mettre à jour le statut d'un message
  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', status }),
      });

      if (response.ok) {
        loadMessages();
        loadStats();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Obtenir la couleur de priorité
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'NORMAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir l'icône de type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'REQUEST': return <MessageSquare className="w-4 h-4" />;
      case 'CONTACT': return <Phone className="w-4 h-4" />;
      case 'REVIEW': return <Star className="w-4 h-4" />;
      case 'SYSTEM': return <AlertCircle className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  // Obtenir la couleur du badge de statut
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'UNREAD': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'READ': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtenir le texte du statut
  const getStatusText = (status: string) => {
    switch (status) {
      case 'UNREAD': return 'Non lu';
      case 'READ': return 'Lu';
      case 'ARCHIVED': return 'Archivé';
      case 'IN_PROGRESS': return 'En cours';
      case 'COMPLETED': return 'Exécuté';
      case 'URGENT': return 'Urgent';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">📨 Messagerie</h1>
            <p className="text-sm sm:text-base text-gray-600">Consultez et gérez tous vos messages en un seul endroit</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
          </Link>
        </div>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-7 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Card>
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Total</p>
                    <p className="text-lg sm:text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Non lus</p>
                    <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.unread}</p>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Lus</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.read}</p>
                  </div>
                  <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Archivés</p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-600">{stats.archived}</p>
                  </div>
                  <Archive className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">En cours</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                  </div>
                  <PlayCircle className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Exécutés</p>
                    <p className="text-lg sm:text-2xl font-bold text-purple-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-2 sm:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Urgents</p>
                    <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.urgent}</p>
                  </div>
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtres et recherche */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Recherche */}
              <div className="w-full">
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                    searching ? 'text-blue-500 animate-pulse' : 'text-gray-400'
                  }`} />
                  <Input
                    placeholder="Rechercher un message..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-10 text-sm sm:text-base ${
                      searching ? 'border-blue-500 focus:border-blue-500' : ''
                    }`}
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  {!searching && searchTerm && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6 hover:bg-gray-100"
                      title="Effacer la recherche"
                    >
                      <X className="w-3 h-3 text-gray-400" />
                    </Button>
                  )}
                </div>
                {searchTerm && (
                  <div className="mt-1 text-xs text-gray-500 flex items-center justify-between">
                    <span>
                      Recherche: "{searchTerm}"
                      {debouncedSearchTerm !== searchTerm && (
                        <span className="ml-1 text-blue-500">(recherche en cours...)</span>
                      )}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearSearch}
                      className="h-5 px-1 text-xs text-blue-500 hover:text-blue-700"
                    >
                      Effacer
                    </Button>
                  </div>
                )}
              </div>

              {/* Filtres */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="UNREAD">Non lus</SelectItem>
                    <SelectItem value="READ">Lus</SelectItem>
                    <SelectItem value="ARCHIVED">Archivés</SelectItem>
                    <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                    <SelectItem value="COMPLETED">Exécutés</SelectItem>
                    <SelectItem value="URGENT">Urgents</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="REQUEST">Demandes</SelectItem>
                    <SelectItem value="CONTACT">Contact</SelectItem>
                    <SelectItem value="REVIEW">Avis</SelectItem>
                    <SelectItem value="SYSTEM">Système</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Priorité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                    <SelectItem value="HIGH">Haute</SelectItem>
                    <SelectItem value="NORMAL">Normale</SelectItem>
                    <SelectItem value="LOW">Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions groupées */}
        {selectedMessages.length > 0 && (
          <Card className="mb-3 sm:mb-4 border-blue-200 bg-blue-50">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-sm text-blue-800">
                  {selectedMessages.length} message(s) sélectionné(s)
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBatchStatusUpdate('URGENT')}
                    className="text-xs sm:text-sm text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Urgents</span>
                    <span className="sm:hidden">Urg.</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBatchStatusUpdate('IN_PROGRESS')}
                    className="text-xs sm:text-sm text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">En cours</span>
                    <span className="sm:hidden">Cours</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBatchStatusUpdate('COMPLETED')}
                    className="text-xs sm:text-sm text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Exécutés</span>
                    <span className="sm:hidden">Exéc.</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des messages */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Chargement...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all" || priorityFilter !== "all"
                    ? "Aucun message trouvé pour ces critères"
                    : "Aucun message trouvé"
                  }
                </p>
                {(searchTerm || statusFilter !== "all" || typeFilter !== "all" || priorityFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setTypeFilter("all");
                      setPriorityFilter("all");
                      setCurrentPage(1);
                    }}
                    className="mt-3"
                  >
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors ${
                      message.status === 'UNREAD' ? 'bg-blue-50 border-blue-200' : 
                      message.status === 'URGENT' ? 'bg-red-50 border-red-200' :
                      message.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200' :
                      message.status === 'COMPLETED' ? 'bg-green-50 border-green-200' :
                      'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      {/* Checkbox */}
                      <Checkbox
                        checked={selectedMessages.includes(message.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMessages([...selectedMessages, message.id]);
                          } else {
                            setSelectedMessages(selectedMessages.filter(id => id !== message.id));
                          }
                        }}
                        className="mt-1"
                      />

                      {/* Icône et statut */}
                      <div className="flex-shrink-0">
                        <div className={`p-1.5 sm:p-2 rounded-full ${
                          message.status === 'UNREAD' ? 'bg-blue-100' : 
                          message.status === 'URGENT' ? 'bg-red-100' :
                          message.status === 'IN_PROGRESS' ? 'bg-blue-100' :
                          message.status === 'COMPLETED' ? 'bg-green-100' :
                          'bg-gray-100'
                        }`}>
                          <div className={`${
                            message.status === 'UNREAD' ? 'text-blue-600' : 
                            message.status === 'URGENT' ? 'text-red-600' :
                            message.status === 'IN_PROGRESS' ? 'text-blue-600' :
                            message.status === 'COMPLETED' ? 'text-green-600' :
                            'text-gray-600'
                          }`}>
                            {getTypeIcon(message.type)}
                          </div>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <h3 className={`font-semibold text-gray-900 text-sm sm:text-base ${
                                message.status === 'UNREAD' ? 'font-bold' : ''
                              }`}>
                                {message.subject}
                              </h3>
                              <div className="flex flex-wrap gap-1">
                                <Badge className={`text-xs ${getPriorityColor(message.priority)}`}>
                                  {message.priority}
                                </Badge>
                                <Badge className={`text-xs ${getStatusBadgeColor(message.status)}`}>
                                  {getStatusText(message.status)}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {message.senderName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {message.senderPhone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(message.createdAt)}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm line-clamp-2 sm:line-clamp-3">{message.content}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 sm:ml-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedMessage(message);
                                if (message.status === 'UNREAD') {
                                  markAsRead(message.id);
                                }
                              }}
                              className="p-1 h-8 w-8 sm:p-2"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            {message.status === 'UNREAD' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(message.id)}
                                className="p-1 h-8 w-8 sm:p-2"
                              >
                                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            )}
                            {message.status === 'READ' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateMessageStatus(message.id, 'IN_PROGRESS')}
                                className="p-1 h-8 w-8 sm:p-2"
                                title="Marquer en cours"
                              >
                                <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            )}
                            {message.status === 'IN_PROGRESS' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateMessageStatus(message.id, 'COMPLETED')}
                                className="p-1 h-8 w-8 sm:p-2"
                                title="Marquer comme exécuté"
                              >
                                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            )}
                            {message.priority !== 'URGENT' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => updateMessageStatus(message.id, 'URGENT')}
                                className="p-1 h-8 w-8 sm:p-2 text-red-600"
                                title="Marquer comme urgent"
                              >
                                <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => archiveMessage(message.id)}
                              className="p-1 h-8 w-8 sm:p-2"
                            >
                              <Archive className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteMessage(message.id)}
                              className="text-red-600 hover:text-red-700 p-1 h-8 w-8 sm:p-2"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t">
                <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                  Page {currentPage} sur {totalPages}
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-xs sm:text-sm"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline ml-1">Précédent</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline mr-1">Suivant</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de détail du message */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold pr-2">{selectedMessage.subject}</h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedMessage(null)}
                    className="p-1 h-8 w-8 sm:p-2"
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <Badge className={getPriorityColor(selectedMessage.priority)}>
                      {selectedMessage.priority}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {selectedMessage.senderName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedMessage.senderPhone}
                    </span>
                    {selectedMessage.senderEmail && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {selectedMessage.senderEmail}
                      </span>
                    )}
                  </div>

                  <div className="text-xs sm:text-sm text-gray-600">
                    {formatDate(selectedMessage.createdAt)}
                  </div>

                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-sm sm:text-base">{selectedMessage.content}</p>
                  </div>

                  {selectedMessage.photoUrl && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm sm:text-base">Photo jointe:</h4>
                      <img
                        src={selectedMessage.photoUrl}
                        alt="Photo jointe"
                        className="rounded-lg max-w-full h-auto"
                      />
                    </div>
                  )}

                  {selectedMessage.audioUrl && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm sm:text-base">Message audio:</h4>
                      <audio controls className="w-full">
                        <source src={selectedMessage.audioUrl} type="audio/wav" />
                        Votre navigateur ne supporte pas l'audio.
                      </audio>
                    </div>
                  )}

                  {selectedMessage.request && (
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 text-sm sm:text-base">Demande associée:</h4>
                      <div className="text-xs sm:text-sm space-y-1">
                        <p><strong>ID:</strong> {selectedMessage.request.id}</p>
                        <p><strong>Client:</strong> {selectedMessage.request.customer.name}</p>
                        <p><strong>Téléphone:</strong> {selectedMessage.request.customer.phone}</p>
                        {selectedMessage.request.customer.neighborhood && (
                          <p><strong>Quartier:</strong> {selectedMessage.request.customer.neighborhood}</p>
                        )}
                        <p><strong>Statut:</strong> {selectedMessage.request.status}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-6">
                  {selectedMessage.status === 'UNREAD' && (
                    <Button
                      onClick={() => {
                        markAsRead(selectedMessage.id);
                        setSelectedMessage(null);
                      }}
                      className="w-full sm:w-auto text-sm"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Marquer comme lu
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      archiveMessage(selectedMessage.id);
                      setSelectedMessage(null);
                    }}
                    className="w-full sm:w-auto text-sm"
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Archiver
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700 w-full sm:w-auto text-sm"
                    onClick={() => {
                      deleteMessage(selectedMessage.id);
                      setSelectedMessage(null);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}