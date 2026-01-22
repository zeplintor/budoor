"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/dashboard";
import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "@/components/ui";
import { Trash2, Loader2, Map, PenTool, Eye, CheckCircle, AlertCircle, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  createParcelle,
  getParcelles,
  deleteParcelle,
} from "@/lib/firebase/parcelles";
import type { Parcelle } from "@/types";
import { useTranslations } from "next-intl";

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import("@/components/map/MapContainer").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    ),
  }
);

// Cultures avec emojis
const CULTURES_DATA = [
  { id: "ble", emoji: "🌾" },
  { id: "mais", emoji: "🌽" },
  { id: "orge", emoji: "🌿" },
  { id: "colza", emoji: "🌻" },
  { id: "tournesol", emoji: "🌻" },
  { id: "vigne", emoji: "🍇" },
  { id: "olivier", emoji: "🫒" },
  { id: "legumes", emoji: "🥬" },
  { id: "fruits", emoji: "🍎" },
  { id: "prairie", emoji: "🌱" },
];

export default function ParcellesPage() {
  const t = useTranslations();
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [selectedParcelle, setSelectedParcelle] = useState<Parcelle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Get translated cultures
  const CULTURES = CULTURES_DATA.map(c => ({
    ...c,
    label: t(`parcelles.cultures.${c.id}`)
  }));

  // New parcelle dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [newParcelleData, setNewParcelleData] = useState<{
    geometry: { type: "Polygon"; coordinates: number[][][] };
    centroid: { lat: number; lng: number };
    areaHectares: number;
  } | null>(null);
  const [newParcelleName, setNewParcelleName] = useState("");
  const [newParcelleCulture, setNewParcelleCulture] = useState("ble");
  const [customCulture, setCustomCulture] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Load parcelles
  useEffect(() => {
    async function loadParcelles() {
      if (!firebaseUser) return;

      try {
        setIsLoading(true);
        const data = await getParcelles(firebaseUser.uid);
        setParcelles(data);
      } catch (error) {
        console.error("Error loading parcelles:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadParcelles();
  }, [firebaseUser]);

  // Handle new parcelle from map
  const handleParcelleCreated = useCallback(
    (data: {
      geometry: { type: "Polygon"; coordinates: number[][][] };
      centroid: { lat: number; lng: number };
      areaHectares: number;
    }) => {
      setNewParcelleData(data);
      setNewParcelleName("");
      setNewParcelleCulture("ble");
      setCustomCulture("");
      setShowDialog(true);
      setIsDrawing(false);
    },
    []
  );

  // Save new parcelle
  const handleSaveParcelle = async () => {
    if (!firebaseUser || !newParcelleData || !newParcelleName.trim() || !newParcelleCulture) return;
    // If "autre" is selected, customCulture must be filled
    if (newParcelleCulture === "autre" && !customCulture.trim()) return;

    const selectedCulture = CULTURES.find(c => c.id === newParcelleCulture);

    // Determine the culture type to save
    let cultureType: string;
    if (newParcelleCulture === "autre") {
      cultureType = `🌿 ${customCulture.trim()}`;
    } else if (selectedCulture) {
      cultureType = `${selectedCulture.emoji} ${selectedCulture.label}`;
    } else {
      cultureType = newParcelleCulture;
    }

    try {
      setIsSaving(true);
      await createParcelle({
        userId: firebaseUser.uid,
        name: newParcelleName.trim(),
        geometry: newParcelleData.geometry,
        centroid: newParcelleData.centroid,
        areaHectares: newParcelleData.areaHectares,
        cultureType,
      });

      // Reload parcelles
      const data = await getParcelles(firebaseUser.uid);
      setParcelles(data);

      setShowDialog(false);
      setNewParcelleData(null);

      // Show success toast
      setToast({ type: "success", message: t("parcelles.toast.created") });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      console.error("Error saving parcelle:", error);
      setToast({ type: "error", message: t("parcelles.toast.error") });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete parcelle
  const handleDeleteParcelle = async (parcelle: Parcelle) => {
    if (!firebaseUser) return;
    if (!confirm(t("parcelles.delete.confirm", { name: parcelle.name }))) return;

    try {
      await deleteParcelle(firebaseUser.uid, parcelle.id);
      setParcelles((prev) => prev.filter((p) => p.id !== parcelle.id));
      if (selectedParcelle?.id === parcelle.id) {
        setSelectedParcelle(null);
      }
    } catch (error) {
      console.error("Error deleting parcelle:", error);
    }
  };

  // Filter parcelles based on search query
  const filteredParcelles = parcelles.filter((p) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.culture.type.toLowerCase().includes(query)
    );
  });

  const getParcelleCountText = () => {
    if (filteredParcelles.length === 1) {
      return t("parcelles.count", { count: 1 });
    }
    return t("parcelles.countPlural", { count: filteredParcelles.length });
  };

  return (
    <>
      <Header
        title={t("parcelles.title")}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar with parcelles list */}
        <div className="w-80 border-e border-gray-200 bg-white overflow-auto flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <Button
              className="w-full"
              onClick={() => setIsDrawing(true)}
              variant={isDrawing ? "secondary" : "default"}
              data-tour="draw-button"
            >
              <PenTool className="h-4 w-4" />
              {isDrawing ? t("parcelles.drawingActive") : t("parcelles.draw")}
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {getParcelleCountText()}
            </p>
          </div>

          <div className="flex-1 overflow-auto" data-tour="parcelle-list">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : filteredParcelles.length === 0 ? (
              <div className="p-6 text-center">
                <Map className="h-16 w-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">
                  {searchQuery ? t("parcelles.noResults") : t("parcelles.empty.title")}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchQuery ? "" : t("parcelles.empty.description")}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredParcelles.map((parcelle) => (
                  <div
                    key={parcelle.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedParcelle?.id === parcelle.id ? "bg-green-50 border-s-4 border-green-500" : ""
                    }`}
                    onClick={() => setSelectedParcelle(parcelle)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {parcelle.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {parcelle.culture.type}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {parcelle.areaHectares} {t("common.hectares")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/parcelles/${parcelle.id}`);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title={t("parcelles.viewDetails")}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteParcelle(parcelle);
                          }}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                          title={t("common.delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Map container */}
        <div className="flex-1 relative" data-tour="map-container">
          <MapContainer
            parcelles={parcelles}
            onParcelleCreated={handleParcelleCreated}
            onParcelleClick={setSelectedParcelle}
            selectedParcelleId={selectedParcelle?.id}
            isDrawingMode={isDrawing}
          />

          {/* Drawing mode overlay */}
          {isDrawing && (
            <div className="absolute top-4 start-1/2 -translate-x-1/2 pointer-events-none">
              <Card className="pointer-events-auto bg-green-600 text-white border-0">
                <CardContent className="py-3 px-4">
                  <p className="text-sm font-medium">
                    {t("parcelles.drawing.instruction")}
                  </p>
                  <p className="text-xs opacity-80 mt-1">
                    {t("parcelles.drawing.hint")}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cancel drawing button */}
          {isDrawing && (
            <div className="absolute bottom-6 start-1/2 -translate-x-1/2">
              <Button
                variant="outline"
                onClick={() => setIsDrawing(false)}
                className="bg-white"
              >
                {t("parcelles.drawing.cancel")}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === "success"
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* New Parcelle Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogClose onClose={() => setShowDialog(false)} />
        <DialogHeader>
          <DialogTitle>{t("parcelles.dialog.title")}</DialogTitle>
          <DialogDescription>
            {newParcelleData && (
              <span className="text-lg font-semibold text-green-600">
                {newParcelleData.areaHectares} {t("common.hectares")}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">{t("parcelles.dialog.name")}</Label>
            <Input
              id="name"
              placeholder={t("parcelles.dialog.namePlaceholder")}
              value={newParcelleName}
              onChange={(e) => setNewParcelleName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-3">
            <Label>{t("parcelles.dialog.culture")}</Label>
            <div className="grid grid-cols-5 gap-2">
              {CULTURES.map((culture) => (
                <button
                  key={culture.id}
                  type="button"
                  onClick={() => {
                    setNewParcelleCulture(culture.id);
                    setCustomCulture("");
                  }}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                    newParcelleCulture === culture.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl">{culture.emoji}</span>
                  <span className="text-xs mt-1 text-gray-600">{culture.label}</span>
                </button>
              ))}
              {/* Option "Autre" */}
              <button
                type="button"
                onClick={() => setNewParcelleCulture("autre")}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                  newParcelleCulture === "autre"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Plus className="h-6 w-6 text-gray-500" />
                <span className="text-xs mt-1 text-gray-600">{t("parcelles.cultures.autre")}</span>
              </button>
            </div>
            {/* Custom culture input */}
            {newParcelleCulture === "autre" && (
              <Input
                placeholder={t("parcelles.dialog.customCulturePlaceholder")}
                value={customCulture}
                onChange={(e) => setCustomCulture(e.target.value)}
                className="mt-2"
                autoFocus
              />
            )}
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSaveParcelle}
            disabled={!newParcelleName.trim() || !newParcelleCulture || (newParcelleCulture === "autre" && !customCulture.trim()) || isSaving}
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("parcelles.dialog.save")}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
