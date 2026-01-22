import type { WeatherData } from "@/types";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    rain: number;
    weather_code: number;
    cloud_cover: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    uv_index: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    precipitation: number[];
    precipitation_probability: number[];
    weather_code: number[];
    soil_temperature_0cm: number[];
    soil_moisture_0_to_1cm: number[];
    et0_fao_evapotranspiration: number[];
    uv_index: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    et0_fao_evapotranspiration: number[];
  };
}

export interface ExtendedWeatherData extends WeatherData {
  current: WeatherData["current"] & {
    apparentTemperature: number;
    weatherCode: number;
    cloudCover: number;
    windDirection: number;
    windGusts: number;
    uvIndex: number;
    isDay: boolean;
  };
  hourly: WeatherData["hourly"] & {
    humidity: number[];
    precipitationProbability: number[];
    weatherCode: number[];
    soilMoisture: number[];
    uvIndex: number[];
  };
  daily: WeatherData["daily"] & {
    weatherCode: number[];
    apparentTemperatureMax: number[];
    apparentTemperatureMin: number[];
    sunrise: string[];
    sunset: string[];
    uvIndexMax: number[];
    precipitationProbability: number[];
    windSpeedMax: number[];
    evapotranspiration: number[];
  };
}

export async function getWeatherData(lat: number, lng: number): Promise<ExtendedWeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "rain",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "uv_index",
      "is_day",
    ].join(","),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "precipitation_probability",
      "weather_code",
      "soil_temperature_0cm",
      "soil_moisture_0_to_1cm",
      "et0_fao_evapotranspiration",
      "uv_index",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "apparent_temperature_min",
      "sunrise",
      "sunset",
      "uv_index_max",
      "precipitation_sum",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "et0_fao_evapotranspiration",
    ].join(","),
    timezone: "Europe/Paris",
    forecast_days: "14",
  });

  const response = await fetch(`${BASE_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }

  const data: OpenMeteoResponse = await response.json();

  return {
    current: {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      apparentTemperature: data.current.apparent_temperature,
      precipitation: data.current.precipitation,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      cloudCover: data.current.cloud_cover,
      windDirection: data.current.wind_direction_10m,
      windGusts: data.current.wind_gusts_10m,
      uvIndex: data.current.uv_index,
      isDay: data.current.is_day === 1,
    },
    hourly: {
      time: data.hourly.time,
      temperature: data.hourly.temperature_2m,
      humidity: data.hourly.relative_humidity_2m,
      precipitation: data.hourly.precipitation,
      precipitationProbability: data.hourly.precipitation_probability,
      weatherCode: data.hourly.weather_code,
      soilTemperature: data.hourly.soil_temperature_0cm,
      soilMoisture: data.hourly.soil_moisture_0_to_1cm,
      evapotranspiration: data.hourly.et0_fao_evapotranspiration,
      uvIndex: data.hourly.uv_index,
    },
    daily: {
      time: data.daily.time,
      weatherCode: data.daily.weather_code,
      temperatureMax: data.daily.temperature_2m_max,
      temperatureMin: data.daily.temperature_2m_min,
      apparentTemperatureMax: data.daily.apparent_temperature_max,
      apparentTemperatureMin: data.daily.apparent_temperature_min,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
      uvIndexMax: data.daily.uv_index_max,
      precipitationSum: data.daily.precipitation_sum,
      precipitationProbability: data.daily.precipitation_probability_max,
      windSpeedMax: data.daily.wind_speed_10m_max,
      evapotranspiration: data.daily.et0_fao_evapotranspiration,
    },
  };
}

// Weather code to description and emoji
export const WEATHER_CODES: Record<number, { description: string; emoji: string; icon: string }> = {
  0: { description: "Ciel degage", emoji: "☀️", icon: "sun" },
  1: { description: "Peu nuageux", emoji: "🌤️", icon: "cloud-sun" },
  2: { description: "Partiellement nuageux", emoji: "⛅", icon: "cloud-sun" },
  3: { description: "Couvert", emoji: "☁️", icon: "cloud" },
  45: { description: "Brouillard", emoji: "🌫️", icon: "cloud-fog" },
  48: { description: "Brouillard givrant", emoji: "🌫️", icon: "cloud-fog" },
  51: { description: "Bruine legere", emoji: "🌧️", icon: "cloud-drizzle" },
  53: { description: "Bruine moderee", emoji: "🌧️", icon: "cloud-drizzle" },
  55: { description: "Bruine dense", emoji: "🌧️", icon: "cloud-drizzle" },
  61: { description: "Pluie legere", emoji: "🌧️", icon: "cloud-rain" },
  63: { description: "Pluie moderee", emoji: "🌧️", icon: "cloud-rain" },
  65: { description: "Pluie forte", emoji: "🌧️", icon: "cloud-rain" },
  66: { description: "Pluie verglacante legere", emoji: "🌨️", icon: "cloud-hail" },
  67: { description: "Pluie verglacante forte", emoji: "🌨️", icon: "cloud-hail" },
  71: { description: "Neige legere", emoji: "🌨️", icon: "cloud-snow" },
  73: { description: "Neige moderee", emoji: "🌨️", icon: "cloud-snow" },
  75: { description: "Neige forte", emoji: "❄️", icon: "snowflake" },
  77: { description: "Grains de neige", emoji: "🌨️", icon: "cloud-snow" },
  80: { description: "Averses legeres", emoji: "🌦️", icon: "cloud-sun-rain" },
  81: { description: "Averses moderees", emoji: "🌦️", icon: "cloud-sun-rain" },
  82: { description: "Averses violentes", emoji: "⛈️", icon: "cloud-lightning" },
  85: { description: "Averses de neige legeres", emoji: "🌨️", icon: "cloud-snow" },
  86: { description: "Averses de neige fortes", emoji: "🌨️", icon: "cloud-snow" },
  95: { description: "Orage", emoji: "⛈️", icon: "cloud-lightning" },
  96: { description: "Orage avec grele legere", emoji: "⛈️", icon: "cloud-lightning" },
  99: { description: "Orage avec grele forte", emoji: "⛈️", icon: "cloud-lightning" },
};

// Get weather info from code
export function getWeatherFromCode(code: number, isDay: boolean = true): { description: string; emoji: string; icon: string } {
  const weather = WEATHER_CODES[code] || { description: "Inconnu", emoji: "❓", icon: "help-circle" };
  // Adjust for night
  if (!isDay && code <= 3) {
    return {
      ...weather,
      emoji: code === 0 ? "🌙" : weather.emoji,
      icon: code === 0 ? "moon" : weather.icon,
    };
  }
  return weather;
}

// Get wind direction as text
export function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

// Get UV index level
export function getUVLevel(uvIndex: number): { level: string; color: string; advice: string } {
  if (uvIndex <= 2) {
    return { level: "Faible", color: "text-green-500", advice: "Aucune protection necessaire" };
  } else if (uvIndex <= 5) {
    return { level: "Modere", color: "text-yellow-500", advice: "Protection recommandee" };
  } else if (uvIndex <= 7) {
    return { level: "Eleve", color: "text-orange-500", advice: "Protection necessaire" };
  } else if (uvIndex <= 10) {
    return { level: "Tres eleve", color: "text-red-500", advice: "Protection renforcee" };
  }
  return { level: "Extreme", color: "text-purple-500", advice: "Eviter l'exposition" };
}

// Calculate Growing Degree Days (GDD) for agriculture
export function calculateGDD(
  tempMax: number,
  tempMin: number,
  baseTemp: number = 10, // Base temperature for most crops
  maxTemp: number = 30 // Maximum temperature cap
): number {
  const cappedMax = Math.min(tempMax, maxTemp);
  const cappedMin = Math.max(tempMin, baseTemp);
  const avgTemp = (cappedMax + cappedMin) / 2;
  return Math.max(0, avgTemp - baseTemp);
}

// Calculate accumulated GDD for forecast period
export function getAccumulatedGDD(weather: ExtendedWeatherData, baseTemp: number = 10): number {
  return weather.daily.temperatureMax.reduce((acc, max, i) => {
    const min = weather.daily.temperatureMin[i];
    return acc + calculateGDD(max, min, baseTemp);
  }, 0);
}

// Get agricultural weather summary
export function getAgriculturalSummary(weather: ExtendedWeatherData): {
  sprayingConditions: "optimal" | "acceptable" | "poor";
  sprayingAdvice: string;
  irrigationNeed: "none" | "low" | "medium" | "high";
  irrigationAdvice: string;
  frostRisk: boolean;
  frostDays: string[];
  heatStress: boolean;
  heatDays: string[];
  gddAccumulated: number;
} {
  // Spraying conditions check
  const windOk = weather.current.windSpeed < 15;
  const rainOk = weather.current.precipitation === 0;
  const humidityOk = weather.current.humidity < 85;

  let sprayingConditions: "optimal" | "acceptable" | "poor" = "poor";
  let sprayingAdvice = "";

  if (windOk && rainOk && humidityOk) {
    sprayingConditions = "optimal";
    sprayingAdvice = "Conditions ideales pour les traitements phytosanitaires";
  } else if (rainOk && (windOk || humidityOk)) {
    sprayingConditions = "acceptable";
    sprayingAdvice = weather.current.windSpeed >= 15
      ? "Vent un peu fort - pulveriser tot le matin"
      : "Humidite elevee - privilegier le milieu de journee";
  } else {
    sprayingAdvice = rainOk
      ? "Conditions defavorables - reporter le traitement"
      : "Pluie en cours - ne pas traiter";
  }

  // Irrigation need based on ET and precipitation
  const totalPrecip7Days = weather.daily.precipitationSum.slice(0, 7).reduce((a, b) => a + b, 0);
  const totalET7Days = weather.daily.evapotranspiration.slice(0, 7).reduce((a, b) => a + b, 0);
  const waterBalance = totalPrecip7Days - totalET7Days;

  let irrigationNeed: "none" | "low" | "medium" | "high" = "none";
  let irrigationAdvice = "";

  if (waterBalance >= 0) {
    irrigationNeed = "none";
    irrigationAdvice = `Precipitations suffisantes (${totalPrecip7Days.toFixed(0)}mm prevus)`;
  } else if (waterBalance > -20) {
    irrigationNeed = "low";
    irrigationAdvice = `Deficit leger: ${Math.abs(waterBalance).toFixed(0)}mm a compenser`;
  } else if (waterBalance > -40) {
    irrigationNeed = "medium";
    irrigationAdvice = `Deficit modere: ${Math.abs(waterBalance).toFixed(0)}mm - irrigation recommandee`;
  } else {
    irrigationNeed = "high";
    irrigationAdvice = `Deficit important: ${Math.abs(waterBalance).toFixed(0)}mm - irrigation urgente`;
  }

  // Frost risk
  const frostDays = weather.daily.time.filter((_, i) => weather.daily.temperatureMin[i] <= 2);
  const frostRisk = frostDays.length > 0;

  // Heat stress (>35°C)
  const heatDays = weather.daily.time.filter((_, i) => weather.daily.temperatureMax[i] >= 35);
  const heatStress = heatDays.length > 0;

  // GDD
  const gddAccumulated = getAccumulatedGDD(weather);

  return {
    sprayingConditions,
    sprayingAdvice,
    irrigationNeed,
    irrigationAdvice,
    frostRisk,
    frostDays: frostDays.map(d => new Date(d).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })),
    heatStress,
    heatDays: heatDays.map(d => new Date(d).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" })),
    gddAccumulated: Math.round(gddAccumulated),
  };
}

// Get hourly forecast for next 24h
export function getNext24hForecast(weather: ExtendedWeatherData): {
  time: string;
  hour: string;
  temperature: number;
  precipitation: number;
  precipitationProbability: number;
  weatherCode: number;
}[] {
  const now = new Date();
  const next24h = weather.hourly.time
    .map((time, i) => ({
      time,
      hour: new Date(time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      temperature: weather.hourly.temperature[i],
      precipitation: weather.hourly.precipitation[i],
      precipitationProbability: weather.hourly.precipitationProbability[i],
      weatherCode: weather.hourly.weatherCode[i],
    }))
    .filter((h) => new Date(h.time) >= now)
    .slice(0, 24);

  return next24h;
}

// Legacy function for backward compatibility
export function getWeatherSummary(weather: ExtendedWeatherData): {
  condition: "sunny" | "cloudy" | "rainy" | "stormy";
  description: string;
  icon: string;
} {
  const code = weather.current.weatherCode;
  const info = getWeatherFromCode(code, weather.current.isDay);

  let condition: "sunny" | "cloudy" | "rainy" | "stormy" = "sunny";
  if (code >= 95) condition = "stormy";
  else if (code >= 51) condition = "rainy";
  else if (code >= 3) condition = "cloudy";

  return {
    condition,
    description: info.description,
    icon: info.icon,
  };
}

// Calculate precipitation forecast for next days
export function getPrecipitationForecast(weather: ExtendedWeatherData): {
  day: string;
  amount: number;
  probability: number;
}[] {
  return weather.daily.time.map((time, index) => ({
    day: new Date(time).toLocaleDateString("fr-FR", { weekday: "short" }),
    amount: weather.daily.precipitationSum[index],
    probability: weather.daily.precipitationProbability[index],
  }));
}
