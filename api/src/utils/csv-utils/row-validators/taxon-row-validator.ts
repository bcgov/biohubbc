import { TaxonMap } from '../../../services/import-services/utils/taxon';
import { CSVConfigUtils } from '../csv-config-utils';
import { CSVRowParams, CSVRowValidator } from '../csv-config-validation.interface';
import { updateCSVRowState } from '../csv-header-configs';

/**
 * Get the taxon header cell validator.
 *
 * Rules:
 *  1. The cell must be a valid ITIS TSN or scientific name
 *  2. The cell must be a valid species from the provided taxons
 *  3. The row state will be updated with the TSN and scientific name
 *
 * @param {TaxonMap} taxonMap The list of taxons
 * @returns {*} {CSVCellValidator} The validate cell callback
 */
export const getTaxonRowValidator = <StaticHeaderType = Uppercase<string>>(
  taxonMap: TaxonMap,
  utils: CSVConfigUtils<StaticHeaderType>,
  taxonStaticHeader: StaticHeaderType
): CSVRowValidator => {
  return (params: CSVRowParams) => {
    const taxonIdentifierCell = utils.getCellValue(taxonStaticHeader, params.row);
    const taxonHeader = utils.getWorksheetHeader(taxonStaticHeader, params.row);

    if (taxonIdentifierCell === undefined) {
      return [
        {
          error: 'Cell is required',
          solution: 'Use a valid ITIS TSN or scientific name',
          header: taxonHeader,
          cell: taxonIdentifierCell
        }
      ];
    }

    const taxon = taxonMap.get(taxonIdentifierCell);

    // If a valid taxon
    if (taxon) {
      // Update the row state with the TSN and scientific name
      updateCSVRowState(params.row, { itis_tsn: taxon.tsn, itis_scientific_name: taxon.scientificName });

      return [];
    }

    // If an invalid TSN
    if (typeof taxonIdentifierCell === 'number') {
      return [
        {
          error: 'Invalid ITIS TSN',
          solution: 'Use a valid ITIS TSN',
          header: taxonHeader,
          cell: taxonIdentifierCell
        }
      ];
    }

    // If an invalid scientific name
    if (typeof taxonIdentifierCell === 'string') {
      return [
        {
          error: 'Invalid scientific name',
          solution: 'Use a valid scientific name',
          header: taxonHeader,
          cell: taxonIdentifierCell
        }
      ];
    }

    return [
      {
        error: 'Invalid species',
        solution: 'Expecting a valid ITIS TSN or scientific name',
        header: taxonHeader,
        cell: taxonIdentifierCell
      }
    ];
  };
};
