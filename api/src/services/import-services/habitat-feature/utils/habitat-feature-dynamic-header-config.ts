import { CSVCellValidator } from '../../../../utils/csv-utils/csv-config-validation.interface';

/**
 * Get the habitat feature dynamic header config.
 *
 * TODO: Implement the dynamic header config validation for quantitative and qualitative habitat feature attributes.
 *
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getObservationDynamicHeaderCellValidator = (): CSVCellValidator => {
  return () => {
    return [];
  };
};
