import { ICode } from '../../../../repositories/code-repository';
import { CaseInsensitiveMap } from '../../../../utils/case-insensitive-map';
import { CSVCellValidator } from '../../../../utils/csv-utils/csv-config-validation.interface';

/**
 * Get the observation subcount sign cell validator
 *
 * Rules:
 *  1. The cell must be a valid subcount sign or undefined
 *  2. The cell value will be mutated to the subcount sign ID
 *
 * @param {ICode[]} subcountSigns - The subcount signs
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getObservationSubcountSignCellValidator = (subcountSigns: ICode[]): CSVCellValidator => {
  const subcountSignMap = new CaseInsensitiveMap(subcountSigns.map((sign) => [sign.name, sign]));

  return (params) => {
    // Undefined values are allowed, return no errors
    if (!params.cell) {
      return [];
    }

    // Attempt to get the subcount sign from the map
    const subcountSign = subcountSignMap.get(String(params.cell));

    // Value is not a subcount sign, return an error
    if (!subcountSign) {
      return [
        {
          error: `Invalid subcount sign`,
          solution: `Use a valid subcount sign`,
          values: subcountSigns.map((sign) => sign.name)
        }
      ];
    }

    // Mutate the cell value to be the subcount sign ID
    params.mutateCell = subcountSign.id;

    return [];
  };
};
