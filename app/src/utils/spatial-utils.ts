import { SAMPLING_SITE_SPATIAL_TYPE } from 'constants/spatial';
import { Feature, Point } from 'geojson';
import { isDefined } from './Utils';

/**
 * Checks whether a latitude value is valid.
 *
 * A valid latitude is between -90 and 90 degrees, inclusive.
 *
 * @param {(number | null | undefined)} latitude
 * @return {*}  {boolean} 'true' if the latitude is valid, 'false' otherwise.
 */
export const isValidLatitude = (latitude: number | null | undefined): boolean => {
  return isDefined(latitude) && latitude >= -90 && latitude <= 90;
};

/**
 * Checks whether a longitude value is valid.
 *
 * A valid longitude is between -180 and 180 degrees, inclusive.
 *
 * @param {(number | null | undefined)} longitude
 * @return {*}  {boolean} 'true' if the longitude is valid, 'false' otherwise.
 */
export const isValidLongitude = (longitude: number | null | undefined): boolean => {
  return isDefined(longitude) && longitude >= -180 && longitude <= 180;
};

/**
 * Checks whether a latitude-longitude pair of coordinates is valid.
 *
 * A valid latitude is between -90 and 90 degrees, inclusive.
 * A valid longitude is between -180 and 180 degrees, inclusive.
 *
 * @param {(number | null | undefined)} latitude
 * @param {(number | null | undefined)} longitude
 * @return {*}  {boolean} 'true' if the coordinates are valid, 'false' otherwise.
 */
export const isValidCoordinates = (
  latitude: number | null | undefined,
  longitude: number | null | undefined
): boolean => {
  return isValidLatitude(latitude) && isValidLongitude(longitude);
};

/**
 * Gets latitude and longitude values from a GeoJson Point Feature.
 *
 * @param {Feature<Point>} feature
 * @return {*}  {{ latitude: number; longitude: number }}
 */
export const getCoordinatesFromGeoJson = (feature: Feature<Point>): { latitude: number; longitude: number } => {
  const longitude = feature.geometry.coordinates[0];
  const latitude = feature.geometry.coordinates[1];

  return { latitude, longitude };
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

/**
 * Get the spatial type of a sampling site feature (Point, Transect, Area, etc).
 *
 * @param {Feature} feature
 * @return {*}  {(SAMPLING_SITE_SPATIAL_TYPE | null)}
 */
export const getSamplingSiteSpatialType = (type: string): SAMPLING_SITE_SPATIAL_TYPE | null => {
  if (['MultiLineString', 'LineString'].includes(type)) {
    return SAMPLING_SITE_SPATIAL_TYPE.TRANSECT;
  }

  if (['Point', 'MultiPoint'].includes(type)) {
    return SAMPLING_SITE_SPATIAL_TYPE.POINT;
  }

  if (['Polygon', 'MultiPolygon'].includes(type)) {
    return SAMPLING_SITE_SPATIAL_TYPE.AREA;
  }

  return null;
};

/**
 * Create a GeoJson Point Feature.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @return {*}  {Feature<Point>}
 */
export const createPointFeature = (latitude: number, longitude: number): Feature<Point> => {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  };
};
