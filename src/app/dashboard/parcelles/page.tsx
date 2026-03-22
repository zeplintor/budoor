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
import { Trash2, Loader2, Map, PenTool, Eye, CheckCircle, AlertCircle, Plus, List, MapIcon, ChevronRight, Sprout } from "lucide-react";
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
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  // Get translated cultures
  const CULTURES = CULTURES_DATA.map(c => ({
    ...c,
    label: t(`parcelles.cultures.${c.id}`)
  }));

  // New parcelle dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [dialogStep, setDialogStep] = useState<1 | 2>(1);
  const [newParcelleData, setNewParcelleData] = useState<{
    geometry: { type: "Polygon"; coordinates: number[][][] };
    centroid: { lat: number; lng: number };
    areaHectares: number;
  } | null>(null);
  const [newParcelleName, setNewParcelleName] = useState("");
  const [newParcelleCulture, setNewParcelleCulture] = useState("ble");
  const [customCulture, setCustomCulture] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Agronomic profile state
  const [profilePlantingDate, setProfilePlantingDate] = useState("");
  const [profileTreeHeight, setProfileTreeHeight] = useState("");
  const [profileTreeCondition, setProfileTreeCondition] = useState<"" | "excellent" | "good" | "average" | "poor">("");
  const [profileIrrigationType, setProfileIrrigationType] = useState<"" | "drip" | "sprinkler" | "gravity" | "rainfed">("");
  const [profilePlantingDensity, setProfilePlantingDensity] = useState("");
  const [profileYieldTarget, setProfileYieldTarget] = useState("");

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
      setDialogStep(1);
      setProfilePlantingDate("");
      setProfileTreeHeight("");
      setProfileTreeCondition("");
      setProfileIrrigationType("");
      setProfilePlantingDensity("");
      setProfileYieldTarget("");
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
        ...(profilePlantingDate && { plantingDate: new Date(profilePlantingDate) }),
        ...(profileTreeHeight && { treeHeight: parseFloat(profileTreeHeight) }),
        ...(profileTreeCondition && { treeCondition: profileTreeCondition }),
        ...(profileIrrigationType && { irrigationType: profileIrrigationType }),
        ...(profilePlantingDensity && { plantingDensity: parseInt(profilePlantingDensity) }),
        ...(profileYieldTarget && { yieldTarget: parseFloat(profileYieldTarget) }),
      });

      // Reload parcelles
      const data = await getParcelles(firebaseUser.uid);
      setParcelles(data);

      setShowDialog(false);
      setNewParcelleData(null);

      // Navigate to the new parcelle's detail page so user sees the "Rapport IA" CTA
      const created = data.find(p =>
        p.name === newParcelleName.trim() &&
        Math.abs(p.centroid.lat - newParcelleData.centroid.lat) < 0.0001
      );
      if (created) {
        router.push(`/dashboard/parcelles/${created.id}`);
      } else {
        setToast({ type: "success", message: t("parcelles.toast.created") });
        setTimeout(() => setToast(null), 3000);
      }
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

  // Switch to map view when drawing starts
  useEffect(() => {
    if (isDrawing) {
      setMobileView("map");
    }
  }, [isDrawing]);

  return (
    <>
      <Header
        title={t("parcelles.title")}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
        {/* Sidebar with parcelles list - hidden on mobile when viewing map */}
        <div className={`${mobileView === "map" ? "hidden" : "flex"} md:flex w-full md:w-80 border-e border-gray-200 bg-white overflow-auto flex-col`}>
          <div className="p-3 md:p-4 border-b border-gray-200 space-y-3">
            <Button
              className="w-full h-11"
              onClick={() => {
                setIsDrawing(true);
                setMobileView("map");
              }}
              variant={isDrawing ? "secondary" : "default"}
              data-tour="draw-button"
            >
              <PenTool className="h-4 w-4" />
              {isDrawing ? t("parcelles.drawingActive") : t("parcelles.draw")}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              {getParcelleCountText()}
            </p>
            {/* Mobile: Show map button */}
            <Button
              variant="outline"
              className="w-full h-11 md:hidden"
              onClick={() => setMobileView("map")}
            >
              <MapIcon className="h-4 w-4" />
              Voir la carte
            </Button>
          </div>

          <div className="flex-1 overflow-auto" data-tour="parcelle-list">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : filteredParcelles.length === 0 ? (
              <div className="p-6 text-center">
                <Map className="h-12 w-12 md:h-16 md:w-16 text-gray-200 mx-auto mb-4" />
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
                    className={`p-3 md:p-4 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100 ${
                      selectedParcelle?.id === parcelle.id ? "bg-green-50 border-s-4 border-green-500" : ""
                    }`}
                    onClick={() => {
                      setSelectedParcelle(parcelle);
                      setMobileView("map"); // Show map on mobile when selecting
                    }}
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
                          className="p-2.5 text-gray-400 hover:text-green-600 transition-colors touch-target"
                          title={t("parcelles.viewDetails")}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteParcelle(parcelle);
                          }}
                          className="p-2.5 text-gray-300 hover:text-red-500 transition-colors touch-target"
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

        {/* Map container - hidden on mobile when viewing list */}
        <div className={`${mobileView === "list" ? "hidden" : "flex"} md:flex flex-1 relative`} data-tour="map-container">
          <MapContainer
            parcelles={parcelles}
            onParcelleCreated={handleParcelleCreated}
            onParcelleClick={setSelectedParcelle}
            selectedParcelleId={selectedParcelle?.id}
            isDrawingMode={isDrawing}
          />

          {/* Mobile: Back to list button */}
          <div className="absolute top-3 left-3 md:hidden z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileView("list")}
              className="bg-white shadow-md h-10 px-3"
            >
              <List className="h-4 w-4" />
              <span className="ml-2">Liste</span>
            </Button>
          </div>

          {/* Drawing mode overlay */}
          {isDrawing && (
            <div className="absolute top-3 md:top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10 w-[90%] md:w-auto">
              <Card className="pointer-events-auto bg-green-600 text-white border-0">
                <CardContent className="py-2 px-3 md:py-3 md:px-4">
                  <p className="text-xs md:text-sm font-medium">
                    {t("parcelles.drawing.instruction")}
                  </p>
                  <p className="text-xs opacity-80 mt-1 hidden md:block">
                    {t("parcelles.drawing.hint")}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cancel drawing button */}
          {isDrawing && (
            <div className="absolute bottom-6 start-1/2 -translate-x-1/2 z-10">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDrawing(false);
                }}
                className="bg-white shadow-md"
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
            <div className="flex items-center gap-3 mt-1">
              {newParcelleData && (
                <span className="text-base font-semibold text-green-600">
                  {newParcelleData.areaHectares} {t("common.hectares")}
                </span>
              )}
              {/* Step indicator */}
              <div className="flex items-center gap-1.5 ms-auto">
                <div className={`h-2 w-6 rounded-full transition-colors ${dialogStep === 1 ? "bg-green-500" : "bg-gray-200"}`} />
                <div className={`h-2 w-6 rounded-full transition-colors ${dialogStep === 2 ? "bg-green-500" : "bg-gray-200"}`} />
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {dialogStep === 1 ? (
          <>
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
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                  {CULTURES.map((culture) => (
                    <button
                      key={culture.id}
                      type="button"
                      onClick={() => { setNewParcelleCulture(culture.id); setCustomCulture(""); }}
                      className={`flex flex-col items-center p-2 md:p-3 rounded-lg border-2 transition-all touch-target ${
                        newParcelleCulture === culture.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-xl md:text-2xl">{culture.emoji}</span>
                      <span className="text-[10px] md:text-xs mt-1 text-gray-600 truncate w-full text-center">{culture.label}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewParcelleCulture("autre")}
                    className={`flex flex-col items-center p-2 md:p-3 rounded-lg border-2 transition-all touch-target ${
                      newParcelleCulture === "autre" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Plus className="h-5 w-5 md:h-6 md:w-6 text-gray-500" />
                    <span className="text-[10px] md:text-xs mt-1 text-gray-600">{t("parcelles.cultures.autre")}</span>
                  </button>
                </div>
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
                onClick={() => setDialogStep(2)}
                disabled={!newParcelleName.trim() || !newParcelleCulture || (newParcelleCulture === "autre" && !customCulture.trim())}
              >
                {t("parcelles.dialog.next")}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogContent className="space-y-4">
              {/* Badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100">
                <Sprout className="h-4 w-4 text-green-600 shrink-0" />
                <p className="text-xs text-green-700">{t("parcelles.dialog.profileBadge")}</p>
              </div>

              {/* Date de plantation — KILLER FEATURE */}
              <div className="space-y-1.5">
                <Label htmlFor="plantingDate">{t("parcelles.dialog.plantingDate")}</Label>
                <Input
                  id="plantingDate"
                  type="date"
                  value={profilePlantingDate}
                  onChange={(e) => setProfilePlantingDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Hauteur + État sur 2 colonnes */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="treeHeight">{t("parcelles.dialog.treeHeight")}</Label>
                  <Input
                    id="treeHeight"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder={t("parcelles.dialog.treeHeightPlaceholder")}
                    value={profileTreeHeight}
                    onChange={(e) => setProfileTreeHeight(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("parcelles.dialog.treeCondition")}</Label>
                  <select
                    value={profileTreeCondition}
                    onChange={(e) => setProfileTreeCondition(e.target.value as typeof profileTreeCondition)}
                    className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">{t("parcelles.dialog.treeConditionPlaceholder")}</option>
                    <option value="excellent">{t("parcelles.profile.conditionsShort.excellent")}</option>
                    <option value="good">{t("parcelles.profile.conditionsShort.good")}</option>
                    <option value="average">{t("parcelles.profile.conditionsShort.average")}</option>
                    <option value="poor">{t("parcelles.profile.conditionsShort.poor")}</option>
                  </select>
                </div>
              </div>

              {/* Irrigation */}
              <div className="space-y-1.5">
                <Label>{t("parcelles.dialog.irrigationType")}</Label>
                <select
                  value={profileIrrigationType}
                  onChange={(e) => setProfileIrrigationType(e.target.value as typeof profileIrrigationType)}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">{t("parcelles.dialog.irrigationPlaceholder")}</option>
                  <option value="drip">{t("parcelles.profile.irrigation.drip")}</option>
                  <option value="sprinkler">{t("parcelles.profile.irrigation.sprinkler")}</option>
                  <option value="gravity">{t("parcelles.profile.irrigation.gravity")}</option>
                  <option value="rainfed">{t("parcelles.profile.irrigation.rainfed")}</option>
                </select>
              </div>

              {/* Densité + Rendement */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="density">{t("parcelles.dialog.plantingDensity")}</Label>
                  <Input
                    id="density"
                    type="number"
                    min="0"
                    placeholder={t("parcelles.dialog.plantingDensityPlaceholder")}
                    value={profilePlantingDensity}
                    onChange={(e) => setProfilePlantingDensity(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="yield">{t("parcelles.dialog.yieldTarget")}</Label>
                  <Input
                    id="yield"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder={t("parcelles.dialog.yieldTargetPlaceholder")}
                    value={profileYieldTarget}
                    onChange={(e) => setProfileYieldTarget(e.target.value)}
                  />
                </div>
              </div>
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogStep(1)}>
                ← {t("parcelles.dialog.step1")}
              </Button>
              <Button variant="ghost" onClick={handleSaveParcelle} disabled={isSaving} className="text-gray-500">
                {t("parcelles.dialog.skip")}
              </Button>
              <Button onClick={handleSaveParcelle} disabled={isSaving}>
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("parcelles.dialog.save")}
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </>
  );
}
