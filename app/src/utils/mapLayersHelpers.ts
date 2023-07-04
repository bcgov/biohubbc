import { INonEditableGeometries } from 'components/map/MapContainer';
import { Feature } from 'geojson';

/**
 * Function to returns an array of `Features`.

 * Only one of `geometry` and `nonEditableGeometries` will be defined at any given time.
 * - If the map loads as view-only, then nonEditableGeometries may be defined.
 * - If the map loads as editable, then `geometry` may be defined.
 * - If neither are defined, returns an empty array.
 *
 * Note: when there are existing nonEditableGeometries, and the map is edited,
 * the geometry array will contain all of the previous nonEditableGeometries
 * as well as any newly added/drawn geometries.
 *
 * @param {Feature[] | undefined} geometry
 * @param {INonEditableGeometries[] | undefined} nonEditableGeometries
 * @returns Feature[]
 */
export function determineMapGeometries(
  geometry: Feature[] | undefined,
  nonEditableGeometries: INonEditableGeometries[] | undefined
): Feature[] {
  if (geometry && geometry.length) {
    return geometry;
  }

  if (nonEditableGeometries) {
    return nonEditableGeometries.map((geo: INonEditableGeometries) => geo.feature);
  }

  return [];
}
