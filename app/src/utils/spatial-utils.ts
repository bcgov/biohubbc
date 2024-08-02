import { SAMPLING_SITE_SPATIAL_TYPE } from 'constants/spatial';
import { Feature, Point } from 'geojson';
import { isDefined } from 'utils/Utils';

/**
 * Checks whether a latitude-longitude pair of coordinates is valid
 *
 * @param {(number | undefined)} latitude
 * @param {(number | undefined)} longitude
 * @return {*}  {boolean}
 */
export const isValidCoordinates = (latitude: number | undefined, longitude: number | undefined): boolean => {
  return isDefined(latitude) &&
    isDefined(longitude) &&
    latitude > -90 &&
    latitude < 90 &&
    longitude > -180 &&
    longitude < 180
    ? true
    : false;
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
export const getSamplingSiteSpatialType = (feature: Feature): SAMPLING_SITE_SPATIAL_TYPE | null => {
  const geometryType = feature.geometry.type;

  if (['MultiLineString', 'LineString'].includes(geometryType)) {
    return SAMPLING_SITE_SPATIAL_TYPE.TRANSECT;
  }

  if (['Point', 'MultiPoint'].includes(geometryType)) {
    return SAMPLING_SITE_SPATIAL_TYPE.POINT;
  }

  if (['Polygon', 'MultiPolygon'].includes(geometryType)) {
    return SAMPLING_SITE_SPATIAL_TYPE.AREA;
  }

  return null;
};
