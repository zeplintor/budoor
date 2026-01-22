export {
  getWeatherData,
  getWeatherSummary,
  getPrecipitationForecast,
  getWeatherFromCode,
  getWindDirection,
  getUVLevel,
  getAgriculturalSummary,
  getNext24hForecast,
  WEATHER_CODES,
  type ExtendedWeatherData,
} from "./openMeteo";

export {
  getSoilData,
  getSoilQuality,
} from "./soilGrids";

export {
  getElevationData,
  getElevationForPolygon,
  getElevationClassification,
} from "./openElevation";

export { getParcelleData } from "./parcelleData";
