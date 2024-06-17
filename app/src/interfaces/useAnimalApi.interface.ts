import { ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';
import { ApiPaginationResponseParams } from 'types/misc';

/**
 * Response object for findAnimals.
 *
 * @export
 * @interface IFindAnimalsResponse
 */
export interface IFindAnimalsResponse {
  animals: ICritterDetailedResponse[];
  pagination: ApiPaginationResponseParams;
}
