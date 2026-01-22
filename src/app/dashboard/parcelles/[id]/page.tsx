"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/dashboard";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
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
  Leaf,
  Sun,
  Sunrise,
  Sunset,
  Sprout,
  CloudRain,
  Navigation,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getParcelles } from "@/lib/firebase/parcelles";
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

export default function ParcelleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const [parcelle, setParcelle] = useState<Parcelle | null>(null);
  const [weather, setWeather] = useState<ExtendedWeatherData | null>(null);
  const [soil, setSoil] = useState<SoilDataWithSource | null>(null);
  const [elevation, setElevation] = useState<ElevationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        } else {
          setError("Parcelle non trouvee");
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

  // Load external data
  useEffect(() => {
    async function loadData() {
      if (!parcelle) return;

      try {
        setIsLoadingData(true);
        const data = await getParcelleData(parcelle);
        setWeather(data.weather);
        setSoil(data.soil);
        setElevation(data.elevation);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, [parcelle]);

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
          <p className="text-red-500">{error || "Parcelle non trouvee"}</p>
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

  return (
    <>
      <Header title={parcelle.name} />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Back button and header */}
        <div className="flex items-center justify-between">
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
              <h1 className="text-2xl font-bold text-gray-900">{parcelle.name}</h1>
              <p className="text-gray-500">
                {parcelle.culture.type} - {parcelle.areaHectares} ha
              </p>
            </div>
          </div>
          <Link href="/dashboard/reports">
            <Button>
              <Sparkles className="h-4 w-4" />
              Generer rapport IA
            </Button>
          </Link>
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
                      ? "Attention - A surveiller"
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
            <span className="ml-3 text-gray-500">Chargement des donnees...</span>
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
                          <p className="text-blue-100">Humidite</p>
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
                  <CardTitle className="text-lg">Previsions heure par heure</CardTitle>
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
                        <p className="font-medium">Pulverisation</p>
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
                        <p className="font-medium">Degres-jours cumules (14j)</p>
                        <p className="text-sm text-gray-600">{agriSummary.gddAccumulated} GDD (base 10°C)</p>
                      </div>
                    </div>

                    {/* Frost/Heat warnings */}
                    {agriSummary.frostRisk && (
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="font-medium text-blue-800">Risque de gel</p>
                        <p className="text-sm text-blue-600">Jours concernes: {agriSummary.frostDays.join(", ")}</p>
                      </div>
                    )}
                    {agriSummary.heatStress && (
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="font-medium text-red-800">Stress thermique</p>
                        <p className="text-sm text-red-600">Jours concernes: {agriSummary.heatDays.join(", ")}</p>
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
                      Previsions 14 jours
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <p className="text-gray-400 text-center py-4">Donnees non disponibles</p>
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
                    <p className="text-gray-400 text-center py-4">Donnees non disponibles</p>
                  )}
                </CardContent>
              </Card>

              {/* Parcelle Info Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Leaf className="h-5 w-5 text-green-500" />
                    Informations parcelle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Culture</span>
                      <span className="font-medium">{parcelle.culture.type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Surface</span>
                      <span className="font-medium">{parcelle.areaHectares} ha</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Latitude</span>
                      <span className="font-medium">{parcelle.centroid.lat.toFixed(5)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Longitude</span>
                      <span className="font-medium">{parcelle.centroid.lng.toFixed(5)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}
