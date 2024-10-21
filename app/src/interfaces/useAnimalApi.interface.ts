import { ApiPaginationResponseParams } from 'types/misc';
import { ISex } from './useCritterApi.interface';

export interface IFindAnimalObj {
  wlh_id: string | null;
  animal_id: string;
  sex: ISex;
  itis_tsn: number;
  itis_scientific_name: string;
  critter_comment: string;
  critter_id: number;
  survey_id: number;
  critterbase_critter_id: string;
}

/**
 * Response object for findAnimals.
 *
 * @export
 * @interface IFindAnimalsResponse
 */
export interface IFindAnimalsResponse {
  animals: IFindAnimalObj[];
  pagination: ApiPaginationResponseParams;
}

/**
 * Interface representing the geometry of a mortality event.
 */
interface ICaptureGeometry {
  capture_id: string;
  coordinates: [number, number];
}

/**
 * Interface representing the geometry of a mortality event.
 */
interface IMortalityGeometry {
  mortality_id: string;
  coordinates: [number, number];
}

/**
 * Interface representing  combined capture and mortality geometries
 */
export interface IGetCaptureMortalityGeometryResponse {
  captures: ICaptureGeometry[];
  mortalities: IMortalityGeometry[];
}
