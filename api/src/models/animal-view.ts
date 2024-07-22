import { Point } from 'geojson';

export interface IAnimalAdvancedFilters {
  keyword?: string;
  itis_tsns?: number[];
  itis_tsn?: number;
  system_user_id?: number;
}

/**
 * Interface representing the geometry of a mortality event.
 */
export interface ICaptureGeometry {
  capture_id: string;
  geometry: Point;
}
/**
 * Interface representing the geometry of a mortality event.
 */
export interface IMortalityGeometry {
  mortality_id: string;
  geometry: Point;
}

/**
 * Interface representing  combined capture and mortality geometries
 */
export interface IGetCaptureMortalityGeometryResponse {
  captures: ICaptureGeometry[];
  mortalities: IMortalityGeometry[];
}
