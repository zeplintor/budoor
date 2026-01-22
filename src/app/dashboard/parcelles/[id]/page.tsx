"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import L from "leaflet";
import { Header } from "@/components/dashboard";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui";
import {
  ArrowLeft,
  Loader2,
  Thermometer,
  Droplets,
  Wind,
  Cloud,
  Mountain,
  Layers,
  AlertTriangle,
  CheckCircle,
  Sun,
  Sunrise,
  Sunset,
  Sprout,
  CloudRain,
  Navigation,
  Sparkles,
  Pencil,
  Trash2,
  FileText,
  MapPin,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getParcelles, updateParcelle, deleteParcelle } from "@/lib/firebase/parcelles";
import { getReportsByParcelle, type SavedReport } from "@/lib/firebase/reports";
import {
  getParcelleData,
  getParcelleConditionSummary,
} from "@/lib/api/parcelleData";
import {
  getWeatherFromCode,
  getWindDirection,
  getUVLevel,
  getAgriculturalSummary,
  getNext24hForecast,
  type ExtendedWeatherData,
} from "@/lib/api/openMeteo";
import { getSoilQuality, SoilDataWithSource } from "@/lib/api/soilGrids";
import { getElevationClassification } from "@/lib/api/openElevation";
import type { Parcelle, ElevationData } from "@/types";

// Culture options
const CULTURES = [
  { type: "ble", label: "Blé", emoji: "🌾" },
  { type: "mais", label: "Maïs", emoji: "🌽" },
  { type: "orge", label: "Orge", emoji: "🌿" },
  { type: "colza", label: "Colza", emoji: "🌻" },
  { type: "tournesol", label: "Tournesol", emoji: "🌻" },
  { type: "vigne", label: "Vigne", emoji: "🍇" },
  { type: "olivier", label: "Olivier", emoji: "🫒" },
  { type: "legumes", label: "Légumes", emoji: "🥬" },
  { type: "fruits", label: "Fruits", emoji: "🍎" },
  { type: "prairie", label: "Prairie", emoji: "🌱" },
];

// Mini map component for parcelle preview
function MiniMap({ parcelle }: { parcelle: Parcelle }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });

    mapInstanceRef.current = map;

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {}
    ).addTo(map);

    const polygon = L.polygon(
      parcelle.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]),
      {
        color: "#22c55e",
        fillColor: "#22c55e",
        fillOpacity: 0.4,
        weight: 2,
      }
    );

    polygon.addTo(map);
    map.fitBounds(polygon.getBounds(), { padding: [20, 20] });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [parcelle]);

  return <div ref={mapRef} className="h-full w-full rounded-lg" />;
}

// Dynamic import to avoid SSR issues
const MiniMapNoSSR = dynamic(
  () => Promise.resolve(MiniMap),
  { ssr: false }
);

export default function ParcelleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [parcelle, setParcelle] = useState<Parcelle | null>(null);
  const [weather, setWeather] = useState<ExtendedWeatherData | null>(null);
  const [soil, setSoil] = useState<SoilDataWithSource | null>(null);
  const [elevation, setElevation] = useState<ElevationData | null>(null);
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCulture, setEditCulture] = useState("");
  const [customCulture, setCustomCulture] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load parcelle
  useEffect(() => {
    async function loadParcelle() {
      if (!firebaseUser || !params.id) return;

      try {
        setIsLoading(true);
        const parcelles = await getParcelles(firebaseUser.uid);
        const found = parcelles.find((p) => p.id === params.id);
        if (found) {
          setParcelle(found);
          setEditName(found.name);
          setEditCulture(found.culture.type);
          if (!CULTURES.find(c => c.type === found.culture.type)) {
            setCustomCulture(found.culture.type);
            setEditCulture("autre");
          }
        } else {
          setError("Parcelle non trouvée");
        }
      } catch (err) {
        console.error("Error loading parcelle:", err);
        setError("Erreur lors du chargement");
      } finally {
        setIsLoading(false);
      }
    }

    loadParcelle();
  }, [firebaseUser, params.id]);

  // Load external data and reports
  useEffect(() => {
    async function loadData() {
      if (!parcelle || !firebaseUser) return;

      try {
        setIsLoadingData(true);
        const [data, parcelleReports] = await Promise.all([
          getParcelleData(parcelle),
          getReportsByParcelle(firebaseUser.uid, parcelle.id, 5),
        ]);
        setWeather(data.weather);
        setSoil(data.soil);
        setElevation(data.elevation);
        setReports(parcelleReports);
      } catch (err) {
        console.error("Error loading parcelle data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [parcelle, firebaseUser]);

  // Handle edit save
  const handleSaveEdit = async () => {
    if (!firebaseUser || !parcelle) return;

    const newCultureType = editCulture === "autre" ? customCulture : editCulture;
    if (!editName.trim() || !newCultureType.trim()) {
      setNotification({ type: "error", message: "Le nom et la culture sont requis" });
      return;
    }

    try {
      setIsSaving(true);
      await updateParcelle(firebaseUser.uid, parcelle.id, {
        name: editName.trim(),
        culture: {
          ...parcelle.culture,
          type: newCultureType,
        },
      });

      setParcelle({
        ...parcelle,
        name: editName.trim(),
        culture: {
          ...parcelle.culture,
          type: newCultureType,
        },
      });

      setIsEditOpen(false);
      setNotification({ type: "success", message: "Parcelle mise à jour" });
    } catch (err) {
      console.error("Error updating parcelle:", err);
      setNotification({ type: "error", message: "Impossible de mettre à jour la parcelle" });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!firebaseUser || !parcelle) return;

    try {
      setIsDeleting(true);
      await deleteParcelle(firebaseUser.uid, parcelle.id);
      router.push("/dashboard/parcelles");
    } catch (err) {
      console.error("Error deleting parcelle:", err);
      setNotification({ type: "error", message: "Impossible de supprimer la parcelle" });
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Chargement..." />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      </>
    );
  }

  if (error || !parcelle) {
    return (
      <>
        <Header title="Erreur" />
        <div className="p-6">
          <p className="text-red-500">{error || "Parcelle non trouvée"}</p>
          <Button onClick={() => router.push("/dashboard/parcelles")} className="mt-4">
            Retour aux parcelles
          </Button>
        </div>
      </>
    );
  }

  const weatherInfo = weather ? getWeatherFromCode(weather.current.weatherCode, weather.current.isDay) : null;
  const uvLevel = weather ? getUVLevel(weather.current.uvIndex) : null;
  const agriSummary = weather ? getAgriculturalSummary(weather) : null;
  const hourlyForecast = weather ? getNext24hForecast(weather) : [];
  const soilQuality = soil ? getSoilQuality(soil) : null;
  const elevationClass = elevation ? getElevationClassification(elevation.elevation) : null;
  const conditionSummary =
    weather && soil && elevation
      ? getParcelleConditionSummary({ weather, soil, elevation, fetchedAt: new Date() })
      : null;

  const cultureEmoji = CULTURES.find(c => c.type === parcelle.culture.type)?.emoji || "🌱";

  return (
    <>
      <Header title={parcelle.name} />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Back button and header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/parcelles")}
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{parcelle.name}</h1>
                <span className="text-2xl">{cultureEmoji}</span>
              </div>
              <p className="text-gray-500">
                {parcelle.culture.type} • {parcelle.areaHectares} ha
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Modifier
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setIsDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
            <Link href={`/dashboard/reports?parcelleId=${parcelle.id}`}>
              <Button>
                <Sparkles className="h-4 w-4" />
                Générer rapport IA
              </Button>
            </Link>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`p-4 rounded-lg ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Mini map and reports row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mini Map */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-green-500" />
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 rounded-lg overflow-hidden">
                <MiniMapNoSSR parcelle={parcelle} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">Latitude</p>
                  <p className="font-medium">{parcelle.centroid.lat.toFixed(5)}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-500">Longitude</p>
                  <p className="font-medium">{parcelle.centroid.lng.toFixed(5)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-500" />
                  Historique des rapports
                </CardTitle>
                <Link href={`/dashboard/reports?parcelleId=${parcelle.id}`}>
                  <Button variant="outline" size="sm">Voir tout</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucun rapport généré pour cette parcelle</p>
                  <Link href={`/dashboard/reports?parcelleId=${parcelle.id}`}>
                    <Button variant="outline" size="sm" className="mt-3">
                      Générer le premier rapport
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.odId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          report.status === "alerte" ? "bg-red-100" :
                          report.status === "vigilance" ? "bg-yellow-100" : "bg-green-100"
                        }`}>
                          {report.status === "alerte" ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : report.status === "vigilance" ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {report.status === "alerte" ? "Alerte" :
                             report.status === "vigilance" ? "Vigilance" : "OK"}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(report.generatedAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 max-w-md truncate hidden md:block">
                        {report.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status summary */}
        {conditionSummary && (
          <Card
            className={`${
              conditionSummary.status === "alerte"
                ? "border-red-300 bg-red-50"
                : conditionSummary.status === "attention"
                ? "border-yellow-300 bg-yellow-50"
                : "border-green-300 bg-green-50"
            }`}
          >
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                {conditionSummary.status === "alerte" ? (
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                ) : conditionSummary.status === "attention" ? (
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">
                    {conditionSummary.status === "alerte"
                      ? "Alerte - Action requise"
                      : conditionSummary.status === "attention"
                      ? "Attention - À surveiller"
                      : "Conditions optimales"}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {conditionSummary.alerts.length > 0 && (
                      <ul className="text-sm">
                        {conditionSummary.alerts.map((alert, i) => (
                          <li key={i} className="text-red-700">- {alert}</li>
                        ))}
                      </ul>
                    )}
                    {conditionSummary.opportunities.length > 0 && (
                      <ul className="text-sm">
                        {conditionSummary.opportunities.map((opp, i) => (
                          <li key={i} className="text-green-700">+ {opp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-3 text-gray-500">Chargement des données...</span>
          </div>
        ) : (
          <>
            {/* Main Weather Card */}
            {weather && weatherInfo && (
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="py-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Current conditions */}
                    <div className="text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-4">
                        <span className="text-6xl">{weatherInfo.emoji}</span>
                        <div>
                          <p className="text-5xl font-bold">
                            {Math.round(weather.current.temperature)}°C
                          </p>
                          <p className="text-blue-100">
                            Ressenti {Math.round(weather.current.apparentTemperature)}°C
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-lg">{weatherInfo.description}</p>
                    </div>

                    {/* Weather details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-200" />
                        <div>
                          <p className="text-blue-100">Humidité</p>
                          <p className="font-semibold">{weather.current.humidity}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Wind className="h-5 w-5 text-blue-200" />
                        <div>
                          <p className="text-blue-100">Vent</p>
                          <p className="font-semibold">
                            {Math.round(weather.current.windSpeed)} km/h {getWindDirection(weather.current.windDirection)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-blue-200" />
                        <div>
                          <p className="text-blue-100">Nuages</p>
                          <p className="font-semibold">{weather.current.cloudCover}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sun className="h-5 w-5 text-blue-200" />
                        <div>
                          <p className="text-blue-100">UV</p>
                          <p className="font-semibold">{weather.current.uvIndex} ({uvLevel?.level})</p>
                        </div>
                      </div>
                    </div>

                    {/* Sunrise/Sunset */}
                    <div className="flex flex-col justify-center gap-3">
                      <div className="flex items-center gap-3">
                        <Sunrise className="h-5 w-5 text-yellow-300" />
                        <span>Lever: {new Date(weather.daily.sunrise[0]).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Sunset className="h-5 w-5 text-orange-300" />
                        <span>Coucher: {new Date(weather.daily.sunset[0]).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      {weather.current.precipitation > 0 && (
                        <div className="flex items-center gap-3">
                          <CloudRain className="h-5 w-5 text-blue-200" />
                          <span>Pluie: {weather.current.precipitation} mm</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hourly Forecast */}
            {hourlyForecast.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Prévisions heure par heure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex overflow-x-auto gap-4 pb-2">
                    {hourlyForecast.slice(0, 12).map((hour, i) => {
                      const hourWeather = getWeatherFromCode(hour.weatherCode);
                      return (
                        <div key={i} className="flex-shrink-0 text-center p-3 rounded-lg bg-gray-50 min-w-[80px]">
                          <p className="text-sm text-gray-500">{hour.hour}</p>
                          <p className="text-2xl my-1">{hourWeather.emoji}</p>
                          <p className="font-semibold">{Math.round(hour.temperature)}°</p>
                          {hour.precipitationProbability > 20 && (
                            <p className="text-xs text-blue-500">{hour.precipitationProbability}%</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Agricultural Summary + 14-day forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Agricultural Summary */}
              {agriSummary && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sprout className="h-5 w-5 text-green-500" />
                      Conseils agricoles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Spraying conditions */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        agriSummary.sprayingConditions === "optimal" ? "bg-green-100" :
                        agriSummary.sprayingConditions === "acceptable" ? "bg-yellow-100" : "bg-red-100"
                      }`}>
                        <Navigation className={`h-4 w-4 ${
                          agriSummary.sprayingConditions === "optimal" ? "text-green-600" :
                          agriSummary.sprayingConditions === "acceptable" ? "text-yellow-600" : "text-red-600"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">Pulvérisation</p>
                        <p className="text-sm text-gray-600">{agriSummary.sprayingAdvice}</p>
                      </div>
                    </div>

                    {/* Irrigation */}
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${
                        agriSummary.irrigationNeed === "none" ? "bg-green-100" :
                        agriSummary.irrigationNeed === "low" ? "bg-blue-100" :
                        agriSummary.irrigationNeed === "medium" ? "bg-yellow-100" : "bg-red-100"
                      }`}>
                        <Droplets className={`h-4 w-4 ${
                          agriSummary.irrigationNeed === "none" ? "text-green-600" :
                          agriSummary.irrigationNeed === "low" ? "text-blue-600" :
                          agriSummary.irrigationNeed === "medium" ? "text-yellow-600" : "text-red-600"
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">Irrigation</p>
                        <p className="text-sm text-gray-600">{agriSummary.irrigationAdvice}</p>
                      </div>
                    </div>

                    {/* GDD */}
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-orange-100">
                        <Thermometer className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">Degrés-jours cumulés (14j)</p>
                        <p className="text-sm text-gray-600">{agriSummary.gddAccumulated} GDD (base 10°C)</p>
                      </div>
                    </div>

                    {/* Frost/Heat warnings */}
                    {agriSummary.frostRisk && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="font-medium text-blue-800">Risque de gel</p>
                        <p className="text-sm text-blue-600">Jours concernés: {agriSummary.frostDays.join(", ")}</p>
                      </div>
                    )}
                    {agriSummary.heatStress && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="font-medium text-red-800">Stress thermique</p>
                        <p className="text-sm text-red-600">Jours concernés: {agriSummary.heatDays.join(", ")}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 14-day Forecast */}
              {weather && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Thermometer className="h-5 w-5 text-orange-500" />
                      Prévisions 14 jours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {weather.daily.time.map((time, i) => {
                        const dayWeather = getWeatherFromCode(weather.daily.weatherCode[i]);
                        return (
                          <div
                            key={time}
                            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center gap-3 w-32">
                              <span className="text-xl">{dayWeather.emoji}</span>
                              <span className="text-sm text-gray-600">
                                {new Date(time).toLocaleDateString("fr-FR", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-blue-500 w-10 text-right">
                                {Math.round(weather.daily.temperatureMin[i])}°
                              </span>
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-400 to-orange-400"
                                  style={{
                                    width: `${Math.min(100, (weather.daily.temperatureMax[i] + 10) * 2)}%`,
                                  }}
                                />
                              </div>
                              <span className="text-orange-500 w-10">
                                {Math.round(weather.daily.temperatureMax[i])}°
                              </span>
                            </div>
                            <div className="flex items-center gap-2 w-20 justify-end">
                              {weather.daily.precipitationSum[i] > 0 && (
                                <span className="text-xs text-blue-500 flex items-center">
                                  <Droplets className="h-3 w-3 mr-1" />
                                  {weather.daily.precipitationSum[i].toFixed(1)}mm
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Soil & Elevation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Soil Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Layers className="h-5 w-5 text-amber-600" />
                    Analyse du sol
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {soil ? (
                    <div className="space-y-4">
                      {/* Source indicator */}
                      <div className={`text-xs px-2 py-1 rounded-full text-center ${
                        soil.isEstimated
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {soil.isEstimated ? "⚠️ " : "✓ "}{soil.source}
                      </div>
                      <div className="text-center py-2">
                        <p className="text-xl font-semibold text-gray-900">{soil.texture}</p>
                        <p className="text-sm text-gray-500">pH: {soil.ph}</p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Argile</span>
                            <span>{soil.clay}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-amber-600 h-2 rounded-full transition-all"
                              style={{ width: `${soil.clay}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Sable</span>
                            <span>{soil.sand}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full transition-all"
                              style={{ width: `${soil.sand}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Limon</span>
                            <span>{soil.silt}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-amber-400 h-2 rounded-full transition-all"
                              style={{ width: `${soil.silt}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="pt-2 border-t text-sm">
                        <p className="text-gray-500">Carbone organique: {soil.organicCarbon} g/kg</p>
                      </div>
                      {soilQuality && (
                        <div className={`p-2 rounded text-center ${
                          soilQuality.quality === "excellent" ? "bg-green-100 text-green-700" :
                          soilQuality.quality === "good" ? "bg-green-50 text-green-600" :
                          soilQuality.quality === "average" ? "bg-yellow-50 text-yellow-700" :
                          "bg-red-50 text-red-600"
                        }`}>
                          {soilQuality.description}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">Données non disponibles</p>
                  )}
                </CardContent>
              </Card>

              {/* Elevation Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mountain className="h-5 w-5 text-gray-600" />
                    Topographie
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {elevation ? (
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <p className="text-4xl font-bold text-gray-900">
                          {elevation.elevation} m
                        </p>
                        <p className="text-gray-500">Altitude</p>
                      </div>
                      {elevation.slope !== undefined && (
                        <div className="flex justify-around text-center">
                          <div>
                            <p className="text-2xl font-semibold">{elevation.slope}%</p>
                            <p className="text-sm text-gray-500">Pente</p>
                          </div>
                          {elevation.aspect && (
                            <div>
                              <p className="text-2xl font-semibold">{elevation.aspect}</p>
                              <p className="text-sm text-gray-500">Orientation</p>
                            </div>
                          )}
                        </div>
                      )}
                      {elevationClass && (
                        <div className="pt-4 border-t">
                          <p className="font-medium text-gray-900 mb-2">
                            {elevationClass.description}
                          </p>
                          <ul className="text-sm text-gray-500 space-y-1">
                            {elevationClass.considerations.map((c, i) => (
                              <li key={i}>- {c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">Données non disponibles</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la parcelle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom de la parcelle</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ex: Champ Nord"
              />
            </div>
            <div className="space-y-2">
              <Label>Culture</Label>
              <div className="grid grid-cols-5 gap-2">
                {CULTURES.map((culture) => (
                  <button
                    key={culture.type}
                    type="button"
                    className={`p-3 rounded-lg border-2 transition-all ${
                      editCulture === culture.type
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setEditCulture(culture.type)}
                    title={culture.label}
                  >
                    <span className="text-2xl">{culture.emoji}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className={`p-3 rounded-lg border-2 transition-all ${
                    editCulture === "autre"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setEditCulture("autre")}
                  title="Autre"
                >
                  <span className="text-2xl">+</span>
                </button>
              </div>
              {editCulture === "autre" && (
                <Input
                  value={customCulture}
                  onChange={(e) => setCustomCulture(e.target.value)}
                  placeholder="Saisissez le type de culture"
                  className="mt-2"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la parcelle</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer la parcelle <strong>{parcelle.name}</strong> ?
            </p>
            <p className="text-sm text-red-500 mt-2">
              Cette action est irréversible. Tous les rapports associés seront également supprimés.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
