"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  Clock,
  Plus,
  Trash2,
  Edit2,
  Power,
  Loader2,
  AlertCircle,
  CheckCircle,
  Bell,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import {
  getWhatsAppSchedules,
  createWhatsAppSchedule,
  deleteWhatsAppSchedule,
  toggleWhatsAppScheduleActive,
  type WhatsAppSchedule,
} from "@/lib/firebase/whatsappSchedules";
import { getParcelles } from "@/lib/firebase/parcelles";
import type { Parcelle } from "@/types";

export function WhatsAppScheduleManager() {
  const t = useTranslations();
  const { firebaseUser } = useAuth();
  const [schedules, setSchedules] = useState<WhatsAppSchedule[]>([]);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load schedules and parcelles
  useEffect(() => {
    async function loadData() {
      if (!firebaseUser) return;

      try {
        setIsLoading(true);
        const [schedulesData, parcellesData] = await Promise.all([
          getWhatsAppSchedules(firebaseUser.uid),
          getParcelles(firebaseUser.uid),
        ]);
        setSchedules(schedulesData);
        setParcelles(parcellesData);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Erreur lors du chargement des planifications");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [firebaseUser]);

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!firebaseUser) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette planification?")) return;

    try {
      await deleteWhatsAppSchedule(firebaseUser.uid, scheduleId);
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    } catch (err) {
      console.error("Error deleting schedule:", err);
      setError("Erreur lors de la suppression");
    }
  };

  const handleToggleActive = async (scheduleId: string, isActive: boolean) => {
    if (!firebaseUser) return;

    try {
      await toggleWhatsAppScheduleActive(firebaseUser.uid, scheduleId, !isActive);
      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, isActive: !isActive } : s))
      );
    } catch (err) {
      console.error("Error toggling schedule:", err);
      setError("Erreur lors de la mise à jour");
    }
  };

  const frequencyLabels = {
    daily: "Quotidienne",
    weekly: "Hebdomadaire",
    monthly: "Mensuelle",
    custom: "Personnalisée",
  };

  const daysLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
          <p className="text-gray-500 mt-2">Chargement des planifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="py-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Planifications WhatsApp</h3>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm">
          <Plus className="h-4 w-4" />
          Nouvelle planification
        </Button>
      </div>

      {showForm && (
        <WhatsAppScheduleForm
          parcelles={parcelles}
          onSuccess={() => {
            setShowForm(false);
            // Reload schedules
            if (firebaseUser) {
              getWhatsAppSchedules(firebaseUser.uid).then(setSchedules);
            }
          }}
          onCancel={() => setShowForm(false)}
          editingId={editingId}
        />
      )}

      {schedules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucune planification créée</p>
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              Créer la première planification
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock className="h-5 w-5 text-blue-600" />
                      {schedule.parcelleName}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {frequencyLabels[schedule.frequency]} à {schedule.time}
                      {schedule.timezone && ` (${schedule.timezone})`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleActive(schedule.id, schedule.isActive)}
                    className={`p-2 rounded-lg transition-colors ${
                      schedule.isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Power className="h-5 w-5" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {schedule.frequency === "weekly" && schedule.daysOfWeek && (
                    <div className="flex gap-1">
                      {schedule.daysOfWeek.map((day) => (
                        <span
                          key={day}
                          className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {daysLabels[day]}
                        </span>
                      ))}
                    </div>
                  )}
                  {schedule.frequency === "monthly" && schedule.dayOfMonth && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                      Le {schedule.dayOfMonth} du mois
                    </span>
                  )}
                </div>

                <div className="flex gap-2 text-sm">
                  {schedule.includeAudio && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                      🎙️ Audio
                    </span>
                  )}
                  {schedule.includeChart && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                      📊 Graphiques
                    </span>
                  )}
                </div>

                {schedule.customMessage && (
                  <p className="text-sm text-gray-600 italic">
                    Message: "{schedule.customMessage}"
                  </p>
                )}

                {schedule.lastSentAt && (
                  <p className="text-xs text-gray-500">
                    📤 Dernier envoi:{" "}
                    {new Date(schedule.lastSentAt).toLocaleDateString("fr-FR")} à{" "}
                    {new Date(schedule.lastSentAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}

                {schedule.nextSendAt && (
                  <p className="text-xs font-medium text-green-600">
                    ⏰ Prochain envoi:{" "}
                    {new Date(schedule.nextSendAt).toLocaleDateString("fr-FR")} à{" "}
                    {new Date(schedule.nextSendAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}

                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => setEditingId(schedule.id)}
                    className="flex items-center gap-1 text-sm px-3 py-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="flex items-center gap-1 text-sm px-3 py-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Form component for creating/editing schedules
function WhatsAppScheduleForm({
  parcelles,
  onSuccess,
  onCancel,
  editingId,
}: {
  parcelles: Parcelle[];
  onSuccess: () => void;
  onCancel: () => void;
  editingId: string | null;
}) {
  const { firebaseUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    parcelleId: string;
    frequency: "daily" | "weekly" | "monthly" | "custom";
    time: string;
    timezone: string;
    daysOfWeek: number[];
    dayOfMonth: number;
    includeAudio: boolean;
    includeChart: boolean;
    customMessage: string;
    isActive: boolean;
  }>({
    parcelleId: "",
    frequency: "daily",
    time: "09:00",
    timezone: "Africa/Casablanca",
    daysOfWeek: [1, 3, 5], // Mon, Wed, Fri by default
    dayOfMonth: 1,
    includeAudio: true,
    includeChart: true,
    customMessage: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;

    try {
      setIsSubmitting(true);
      const selectedParcelle = parcelles.find((p) => p.id === formData.parcelleId);
      if (!selectedParcelle) throw new Error("Parcelle not selected");

      const { parcelleId, ...restFormData } = formData;
      await createWhatsAppSchedule(firebaseUser.uid, {
        parcelleId: formData.parcelleId,
        parcelleName: selectedParcelle.name,
        ...restFormData,
      });

      onSuccess();
    } catch (err) {
      console.error("Error creating schedule:", err);
      alert("Erreur lors de la création de la planification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-green-50 border-2 border-green-200">
      <CardHeader>
        <CardTitle className="text-lg">Planifier un envoi WhatsApp</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Parcelle selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Parcelle *
            </label>
            <select
              value={formData.parcelleId}
              onChange={(e) => setFormData({ ...formData, parcelleId: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Sélectionnez une parcelle</option>
              {parcelles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Fréquence *
            </label>
            <select
              value={formData.frequency}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  frequency: e.target.value as "daily" | "weekly" | "monthly" | "custom",
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
              <option value="custom">Personnalisé</option>
            </select>
          </div>

          {/* Days of week for weekly */}
          {formData.frequency === "weekly" && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Jours de la semaine
              </label>
              <div className="flex gap-2">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, index) => (
                  <label key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.daysOfWeek?.includes((index + 1) % 7)}
                      onChange={(e) => {
                        const dayNum = (index + 1) % 7;
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            daysOfWeek: [...(formData.daysOfWeek || []), dayNum],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            daysOfWeek: formData.daysOfWeek?.filter((d) => d !== dayNum),
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Day of month for monthly */}
          {formData.frequency === "monthly" && (
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Jour du mois
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.dayOfMonth}
                onChange={(e) =>
                  setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Heure d'envoi *
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Fuseau horaire
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Africa/Casablanca">Maroc (Africa/Casablanca)</option>
              <option value="UTC">UTC</option>
              <option value="Europe/Paris">Europe/Paris</option>
            </select>
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.includeAudio}
                onChange={(e) => setFormData({ ...formData, includeAudio: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Inclure la narration audio en Darija</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.includeChart}
                onChange={(e) => setFormData({ ...formData, includeChart: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Inclure les graphiques</span>
            </label>
          </div>

          {/* Custom message */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Message personnalisé (optionnel)
            </label>
            <input
              type="text"
              value={formData.customMessage}
              onChange={(e) =>
                setFormData({ ...formData, customMessage: e.target.value })
              }
              placeholder="Ex: Vérifiez bien les recommandations!"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4 border-t border-green-200">
            <Button
              type="submit"
              disabled={isSubmitting || !formData.parcelleId}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                "Créer la planification"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
