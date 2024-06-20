import { ApiPaginationResponseParams } from 'types/misc';

export interface IFindAnimalObj {
  wlh_id: string | null;
  animal_id: string;
  sex: string;
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
