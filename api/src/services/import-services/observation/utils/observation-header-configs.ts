import { ICode } from '../../../../repositories/code-repository';
import { CaseInsensitiveMap } from '../../../../utils/case-insensitive-map';
import { CSVCellValidator } from '../../../../utils/csv-utils/csv-config-validation.interface';

/**
 * Get the observation sign cell validator
 *
 * Rules:
 *  1. The cell must be a valid observation sign or undefined
 *  2. The cell value will be mutated to the observation sign ID
 *
 * @param {ICode[]} observationSigns - The observation signs
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getObservationSignCellValidator = (observationSigns: ICode[]): CSVCellValidator => {
  const observationSignMap = new CaseInsensitiveMap(observationSigns.map((sign) => [sign.name, sign]));

  return (params) => {
    // Undefined values are allowed, return no errors
    if (!params.cell) {
      return [];
    }

    // Attempt to get the observation sign from the map
    const observationSign = observationSignMap.get(String(params.cell));

    // Value is not a observation sign, return an error
    if (!observationSign) {
      return [
        {
          error: `Invalid observation sign`,
          solution: `Use a valid observation sign`,
          values: observationSigns.map((sign) => sign.name)
        }
      ];
    }

    // Mutate the cell value to be the observation sign ID
    params.mutateCell = observationSign.id;

    return [];
  };
};
