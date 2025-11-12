"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Trash2, Phone, MapPin, Zap } from "lucide-react";
import Link from "next/link";

interface Request {
  id: string;
  customer: {
    name: string | null;
    phone: string;
    neighborhood: string | null;
  };
  type: "TEXT" | "AUDIO";
  status: "NEW" | "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
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
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  estimatedCost?: number;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  isActive: boolean;
}

// Données mock - En production, ce serait depuis une base de données
const MOCK_REQUESTS: Request[] = [
  {
    id: "req_001",
    customer: { name: "Kouame Albert", phone: "+225 01 23 45 67", neighborhood: "Abobo" },
    type: "TEXT",
    status: "NEW",
    createdAt: new Date().toISOString(),
    description: "Problème d'\''électricité dans le salon",
    priority: "HIGH",
  },
  {
    id: "req_002",
    customer: { name: "Traore Fatou", phone: "+225 02 34 56 78", neighborhood: "Cocody" },
    type: "AUDIO",
    status: "PLANNED",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    scheduledDate: new Date(Date.now() + 172800000).toISOString(),
    priority: "MEDIUM",
    technician: { id: "1", name: "Kouassi Jean" },
  },
  {
    id: "req_003",
    customer: { name: "Yao Eugene", phone: "+225 03 45 67 89", neighborhood: "Plateau" },
    type: "TEXT",
    status: "IN_PROGRESS",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    description: "Installation de nouveaux circuits électriques",
    technician: { id: "2", name: "Touré Mohamed" },
    priority: "MEDIUM",
    estimatedCost: 500000,
  },
];

export default function DashboardPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [technicianFilter, setTechnicianFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    status: "",
    technicianId: "",
    scheduledDate: "",
    notes: "",
    priority: "",
    estimatedCost: "",
  });

  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(true);

  // Charger les techniciens
  useEffect(() => {
    const mockTechnicians: Technician[] = [
      { id: "1", name: "Kouassi Jean", phone: "+225 01 23 45 67 89", isActive: true },
      { id: "2", name: "Touré Mohamed", phone: "+225 02 34 56 78 90", isActive: true },
      { id: "3", name: "Diabaté Marie", phone: "+225 03 45 67 89 01", isActive: true },
    ];
    setTechnicians(mockTechnicians);
  }, []);

  // Fetch requests from API on mount
  useEffect(() => {
    let mounted = true;
    const fetchRequests = async () => {
      setIsLoadingRequests(true);
      try {
        const res = await fetch('/api/requests');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (mounted && Array.isArray(data)) {
          setRequests(data as Request[]);
        } else if (mounted) {
          // Fallback to mocks if unexpected response
          console.warn('Unexpected /api/requests response, using mocks');
          setRequests(MOCK_REQUESTS);
        }
      } catch (err) {
        console.error('Error fetching /api/requests:', err);
        if (mounted) setRequests(MOCK_REQUESTS);
      } finally {
        if (mounted) setIsLoadingRequests(false);
      }
    };

    fetchRequests();

    return () => { mounted = false };
  }, []);

  // Filtrer les demandes quand les filtres changent
  useEffect(() => {
    filterRequestsList();
  }, [requests, statusFilter, technicianFilter, priorityFilter, searchTerm]);

  const filterRequestsList = useCallback(() => {
    let filtered = [...requests];

    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (technicianFilter !== "all") {
      filtered = filtered.filter((req) => req.technician?.id === technicianFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((req) => req.priority === priorityFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.customer.phone.includes(searchTerm) ||
          req.customer.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Trier par priorité et date de création
    filtered.sort((a, b) => {
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
      if (aPriority !== bPriority) return aPriority - bPriority;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredRequests(filtered);
  }, [requests, statusFilter, technicianFilter, priorityFilter, searchTerm]);

  // Statistiques
  const stats = {
    total: requests.length,
    new: requests.filter((r) => r.status === "NEW").length,
    planned: requests.filter((r) => r.status === "PLANNED").length,
    inProgress: requests.filter((r) => r.status === "IN_PROGRESS").length,
    completed: requests.filter((r) => r.status === "COMPLETED").length,
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      NEW: "bg-red-100 text-red-800 border-red-200",
      PLANNED: "bg-yellow-100 text-yellow-800 border-yellow-200",
      IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-200",
      COMPLETED: "bg-green-100 text-green-800 border-green-200",
      CANCELLED: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      NEW: "Nouvelle",
      PLANNED: "Planifiée",
      IN_PROGRESS: "En cours",
      COMPLETED: "Terminée",
      CANCELLED: "Annulée",
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority?: string) => {
    const colors: Record<string, string> = {
      URGENT: "text-red-600 bg-red-50",
      HIGH: "text-orange-600 bg-orange-50",
      MEDIUM: "text-yellow-600 bg-yellow-50",
      LOW: "text-green-600 bg-green-50",
    };
    return colors[priority || ""] || "text-gray-600 bg-gray-50";
  };

  const getPriorityIcon = (priority?: string) => {
    const icons: Record<string, string> = {
      URGENT: "🔴",
      HIGH: "🟠",
      MEDIUM: "🟡",
      LOW: "🟢",
    };
    return icons[priority || ""] || "◯";
  };

  const openDetailModal = (request: Request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const openEditModal = (request: Request) => {
    setSelectedRequest(request);
    setEditForm({
      status: request.status,
      technicianId: request.technician?.id || "none",
      scheduledDate: request.scheduledDate || "",
      notes: request.notes || "",
      priority: request.priority || "MEDIUM",
      estimatedCost: request.estimatedCost?.toString() || "",
    });
    setIsEditModalOpen(true);
  };

  const saveRequestChanges = () => {
    if (!selectedRequest) return;

    const updatedRequest: Request = {
      ...selectedRequest,
      status: editForm.status as any,
      scheduledDate: editForm.scheduledDate,
      notes: editForm.notes,
      priority: editForm.priority as any,
      estimatedCost: editForm.estimatedCost ? parseFloat(editForm.estimatedCost) : undefined,
      technician: editForm.technicianId
        ? technicians.find((t) => t.id === editForm.technicianId)
        : selectedRequest.technician,
    };

    setRequests(requests.map((r) => (r.id === selectedRequest.id ? updatedRequest : r)));
    setIsEditModalOpen(false);
    alert("✅ Demande mise à jour avec succès!");
  };

  const deleteRequest = (id: string) => {
    if (confirm("❌ Êtes-vous sûr de vouloir supprimer cette demande?")) {
      setRequests(requests.filter((r) => r.id !== id));
      alert("✅ Demande supprimée");
    }
  };

  const updateRequestStatus = (id: string, newStatus: string) => {
    setRequests(
      requests.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r))
    );
  };

  const assignTechnician = (id: string, technicianId: string) => {
    // 'none' means unassign technician
    if (technicianId === 'none' || technicianId === '') {
      setRequests(
        requests.map((r) => (r.id === id ? { ...r, technician: undefined } : r))
      );
      return;
    }

    const technician = technicians.find((t) => t.id === technicianId);
    if (technician) {
      setRequests(
        requests.map((r) =>
          r.id === id
            ? { ...r, technician: { id: technician.id, name: technician.name } }
            : r
        )
      );
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* En-tête */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tableau de bord - EBF Bouaké</h1>
                <p className="text-sm text-gray-600">Gestion des interventions électriques</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline">← Retour au site</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Cartes de statistiques */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Nouvelles</p>
                  <p className="text-3xl font-bold text-red-600">{stats.new}</p>
                </div>
                <div className="text-3xl">🔴</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Planifiées</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.planned}</p>
                </div>
                <div className="text-3xl">🟡</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">En cours</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <div className="text-3xl">🔵</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Terminées</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="text-3xl">🟢</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">🔍 Filtres</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm">Recherche</Label>
              <Input
                placeholder="Nom, téléphone, quartier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm">Statut</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="NEW">Nouvelles</SelectItem>
                  <SelectItem value="PLANNED">Planifiées</SelectItem>
                  <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                  <SelectItem value="COMPLETED">Terminées</SelectItem>
                  <SelectItem value="CANCELLED">Annulées</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Priorité</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  <SelectItem value="URGENT">🔴 Urgent</SelectItem>
                  <SelectItem value="HIGH">🟠 Haute</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Moyenne</SelectItem>
                  <SelectItem value="LOW">🟢 Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm">Technicien</Label>
              <Select value={technicianFilter} onValueChange={setTechnicianFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les techniciens</SelectItem>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tableau des demandes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              📋 Liste des demandes ({filteredRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Quartier</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Technicien</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        Aucune demande trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request, index) => (
                      <TableRow
                        key={request.id}
                        className="hover:bg-gray-50 border-b border-gray-100"
                      >
                        <TableCell className="font-medium">#{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {request.customer.name || "Anonyme"}
                            </div>
                            <div className="text-xs text-gray-500">ID: {request.id.slice(-6)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{request.customer.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{request.customer.neighborhood || "N/A"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getPriorityColor(request.priority)}>
                            <span className="mr-1">{getPriorityIcon(request.priority)}</span>
                            {request.priority || "Moyenne"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={request.status}
                            onValueChange={(value) => updateRequestStatus(request.id, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="NEW">Nouvelle</SelectItem>
                              <SelectItem value="PLANNED">Planifiée</SelectItem>
                              <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                              <SelectItem value="COMPLETED">Terminée</SelectItem>
                              <SelectItem value="CANCELLED">Annulée</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                              value={request.technician?.id || "none"}
                              onValueChange={(value) => assignTechnician(request.id, value)}
                            >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue placeholder="Assigner..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Aucun</SelectItem>
                              {technicians.map((tech) => (
                                <SelectItem key={tech.id} value={tech.id}>
                                  {tech.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          <div>{format(parseISO(request.createdAt), "dd/MM/yyyy", { locale: fr })}</div>
                          {request.scheduledDate && (
                            <div className="text-xs text-blue-600 mt-1">
                              📅 {format(parseISO(request.scheduledDate), "dd/MM", { locale: fr })}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Dialog open={isDetailModalOpen && selectedRequest?.id === request.id} onOpenChange={setIsDetailModalOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openDetailModal(request)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Détails de la demande #{request.id.slice(-6)}</DialogTitle>
                                </DialogHeader>
                                {selectedRequest && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Client</p>
                                        <p className="text-base">{selectedRequest.customer.name || "Anonyme"}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Téléphone</p>
                                        <p className="text-base">{selectedRequest.customer.phone}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Quartier</p>
                                        <p className="text-base">{selectedRequest.customer.neighborhood || "N/A"}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Type</p>
                                        <p className="text-base">{selectedRequest.type}</p>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Statut</p>
                                        <Badge className={getStatusColor(selectedRequest.status)}>
                                          {getStatusLabel(selectedRequest.status)}
                                        </Badge>
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Priorité</p>
                                        <Badge className={getPriorityColor(selectedRequest.priority)}>
                                          {selectedRequest.priority || "Moyenne"}
                                        </Badge>
                                      </div>
                                    </div>
                                    {selectedRequest.description && (
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Description</p>
                                        <p className="text-base text-gray-600 bg-gray-50 p-3 rounded">
                                          {selectedRequest.description}
                                        </p>
                                      </div>
                                    )}
                                    {selectedRequest.photoUrl && (
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">📷 Photo</p>
                                        <img
                                          src={selectedRequest.photoUrl}
                                          alt="Photo de la demande"
                                          className="w-full max-h-64 object-contain rounded border border-gray-300"
                                        />
                                      </div>
                                    )}
                                    {selectedRequest.audioUrl && (
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">🎵 Audio</p>
                                        <audio
                                          controls
                                          className="w-full"
                                          src={selectedRequest.audioUrl}
                                        >
                                          Votre navigateur ne supporte pas la lecture audio.
                                        </audio>
                                      </div>
                                    )}
                                    {selectedRequest.notes && (
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700">Notes</p>
                                        <p className="text-base text-gray-600 bg-gray-50 p-3 rounded">
                                          {selectedRequest.notes}
                                        </p>
                                      </div>
                                    )}
                                    <div>
                                      <Button
                                        className="w-full"
                                        onClick={() => {
                                          setIsDetailModalOpen(false);
                                          openEditModal(selectedRequest);
                                        }}
                                      >
                                        ✏️ Modifier
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteRequest(request.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal d'\''édition */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier la demande</DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Statut</Label>
                    <Select
                      value={editForm.status}
                      onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">Nouvelle</SelectItem>
                        <SelectItem value="PLANNED">Planifiée</SelectItem>
                        <SelectItem value="IN_PROGRESS">En cours</SelectItem>
                        <SelectItem value="COMPLETED">Terminée</SelectItem>
                        <SelectItem value="CANCELLED">Annulée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priorité</Label>
                    <Select
                      value={editForm.priority}
                      onValueChange={(value) => setEditForm({ ...editForm, priority: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">🟢 Basse</SelectItem>
                        <SelectItem value="MEDIUM">🟡 Moyenne</SelectItem>
                        <SelectItem value="HIGH">🟠 Haute</SelectItem>
                        <SelectItem value="URGENT">🔴 Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Technicien assigné</Label>
                    <Select
                      value={editForm.technicianId}
                      onValueChange={(value) => setEditForm({ ...editForm, technicianId: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Sélectionner..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun</SelectItem>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id}>
                            {tech.name} - {tech.phone}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Date prévue</Label>
                    <Input
                      type="date"
                      value={editForm.scheduledDate ? editForm.scheduledDate.split("T")[0] : ""}
                      onChange={(e) =>
                        setEditForm({ ...editForm, scheduledDate: e.target.value + "T00:00:00" })
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Coût estimé (FCFA)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={editForm.estimatedCost}
                      onChange={(e) => setEditForm({ ...editForm, estimatedCost: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes internes</Label>
                  <Textarea
                    placeholder="Ajouter des notes sur cette demande..."
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="mt-2"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={saveRequestChanges}>
                    💾 Sauvegarder
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
