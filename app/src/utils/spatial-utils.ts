import { Feature, Point } from 'geojson';
import { isDefined } from 'utils/Utils';

/**
 * Get a point feature from the given latitude and longitude.
 *
 * @template Return00PointType
 * @param {{
 *   latitude?: number; // Latitude of the point
 *   longitude?: number; // Longitude of the point
 *   properties?: Record<string, any>; // Properties of the point feature
 *   return00Point?: Return00PointType; // By default, if latitude or longitude is not defined, return null. If this is
 *   set to true, the default value for latitude and longitude will be 0, and a non-null point feature will be returned.
 * }} params
 * @return {*}  {(Return00PointType extends true ? Feature : Feature | null)}
 */
export const getPointFeature = <Return00PointType extends boolean = false>(params: {
  latitude?: number;
  longitude?: number;
  properties?: Record<string, any>;
  return00Point?: Return00PointType;
}): Return00PointType extends true ? Feature : Feature | null => {
  if (!params.return00Point && (!isDefined(params.latitude) || !isDefined(params.longitude))) {
    return null as Return00PointType extends true ? Feature : Feature | null;
  }

  return {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [params.longitude ?? 0, params.latitude ?? 0]
    },
    properties: { ...params.properties }
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
 * @param {(Feature | any)} [feature]
 * @return {*}  {feature is Feature<Point>}
 */
export const isGeoJsonPointFeature = (feature?: Feature | any): feature is Feature<Point> => {
  return (feature as Feature)?.geometry.type === 'Point';
};
