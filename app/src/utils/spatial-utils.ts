import { Feature } from 'geojson';
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
