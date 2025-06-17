import { TaxonMap } from '../../../services/import-services/utils/taxon';
import { CSVConfigUtils } from '../csv-config-utils';
import { CSVCellValidatorOptions, CSVRowParams, CSVRowValidator } from '../csv-config-validation.interface';
import { getTaxonCellValidator } from '../csv-header-configs';

/**
 * Get the taxon header cell validator.
 *
 * Rules:
 *  1. The cell must be a valid ITIS TSN or scientific name
 *  2. The cell must be a valid species from the provided taxons
 *  3. The row state will be updated with the TSN and scientific name
 *
 * @template StaticHeaderType
 * @param {TaxonMap} taxonMap The list of taxons
 * @param {CSVConfigUtils} utils The CSV config utils
 * @param {string} taxonStaticHeader The taxon static header
 * @param {CSVCellValidatorOptions} [options] cell validator options
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getTaxonRowValidator = <StaticHeaderType extends Uppercase<string> = Uppercase<string>>(
  taxonMap: TaxonMap,
  utils: CSVConfigUtils<StaticHeaderType>,
  taxonStaticHeader: StaticHeaderType,
  options?: CSVCellValidatorOptions
): CSVRowValidator => {
  return (params: CSVRowParams) => {
    const taxonIdentifierCell = utils.getCellValue(taxonStaticHeader, params.row);
    const taxonHeader = utils.getWorksheetHeader(taxonStaticHeader, params.row);

    const taxonCellValidator = getTaxonCellValidator(taxonMap, options);

    const errors = taxonCellValidator({
      cell: taxonIdentifierCell,
      mutateCell: taxonIdentifierCell,
      header: taxonHeader as string,
      row: params.row,
      rowIndex: params.rowIndex
    });

    return errors.map((error) => {
      return {
        ...error,
        header: taxonHeader ?? null
      };
    });
  };
};
