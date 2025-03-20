import { ICode } from '../../../../repositories/code-repository';
import { CaseInsensitiveMap } from '../../../../utils/case-insensitive-map';
import { CSVCellValidator } from '../../../../utils/csv-utils/csv-config-validation.interface';

/**
 * Get the habitat feature type cell validator
 *
 * Rules:
 *  1. The cell must be a valid habitat feature type or undefined
 *  2. The cell value will be mutated to the habitat feature type ID
 *
 * @param {ICode[]} habitatFeatureTypes - The habitat feature types
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getHabitatFeatureTypeCellValidator = (habitatFeatureTypes: ICode[]): CSVCellValidator => {
  const habitatFeatureTypeMap = new CaseInsensitiveMap(habitatFeatureTypes.map((item) => [item.name, item]));

  return (params) => {
    // Undefined values are allowed, return no errors
    if (!params.cell) {
      return [];
    }

    // Attempt to get the habitat feature type from the map
    const habitatFeatureType = habitatFeatureTypeMap.get(String(params.cell));

    // Value is not a habitat feature type, return an error
    if (!habitatFeatureType) {
      return [
        {
          error: `Invalid habitat feature type`,
          solution: `Use a valid habitat feature type`,
          values: habitatFeatureTypes.map((item) => item.name)
        }
      ];
    }

    // Mutate the cell value to be the habitat feature type ID
    params.mutateCell = habitatFeatureType.id;

    return [];
  };
};
