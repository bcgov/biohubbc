import { Feature, GeoJsonProperties, Point, Position } from 'geojson';

/**
 * Creates a GeoJSON point from a set of coordinates and associated properties.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Point} A GeoJSON point
 */
export const createGeoJSONPoint = (latitude: number, longitude: number): Point => {
  const coordinates: Position = [longitude, latitude];
  return {
    type: 'Point',
    coordinates
  };
};

/**
 * Creates a GeoJSON feature with a point geometry from a set of coordinates and associated properties.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {GeoJsonProperties} [properties={}]
 * @returns {Feature}
 */
export const createGeoJSONFeature = (
  latitude: number,
  longitude: number,
  properties: GeoJsonProperties = {}
): Feature => {
  const point = createGeoJSONPoint(latitude, longitude);

  return {
    type: 'Feature',
    geometry: point,
    properties
  };
};

/**
 * Checks whether a latitude-longitude pair of coordinates is valid
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns boolean
 */
export const isValidCoordinates = (latitude: number | undefined, longitude: number | undefined) => {
  return latitude && longitude && latitude > -90 && latitude < 90 && longitude > -180 && longitude < 180 ? true : false;
};

/**
 * Gets latitude and longitude values from a GeoJson Point Feature.
 *
 * @param {Feature<Point>} feature
 * @return {*}  {{ latitude: number; longitude: number }}
 */
export const getCoordinatesFromGeoJson = (feature: Feature<Point>): { latitude: number; longitude: number } => {
  const lon = feature.geometry.coordinates[0];
  const lat = feature.geometry.coordinates[1];

  return { latitude: lat as number, longitude: lon as number };
};

/**
 * Checks if the given feature is a GeoJson Feature containing a Point.
 *
 * @param {(unknown)} [feature]
 * @return {*}  {feature is Feature<Point>}
 */
export const isGeoJsonPointFeature = (feature?: unknown): feature is Feature<Point> => {
  return (feature as Feature)?.geometry?.type === 'Point';
};
