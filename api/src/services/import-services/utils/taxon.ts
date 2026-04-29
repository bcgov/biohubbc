import lodash from 'lodash';
const { isNumber, partition } = lodash;

import { CaseInsensitiveMap } from '../../../utils/case-insensitive-map';
import { IItisSearchResult, PlatformService } from '../../platform-service';

export type TaxonMap = CaseInsensitiveMap<string | number, IItisSearchResult>;

/**
 * Get a mapping of taxons from a list of taxon identifiers (TSN or scientific name) - case insensitive.
 *
 * @param {Array<string | number>} taxonIdentifiers A list of taxon identifier (TSN or scientific name)
 * @param {PlatformService} platformService The platform service
 * @return {*} {Promise<CaseInsensitiveMap<string | number, IItisSearchResult>>} The taxon map - case insensitive
 */
const getTaxonMapCore = async (
  taxonIdentifiers: Array<string | number>,
  platformService: PlatformService
): Promise<TaxonMap> => {
  const taxonMap = new CaseInsensitiveMap<string | number, IItisSearchResult>();

  // Why? In some scenarios, the taxonIdentifiers will include itis_tsn values as strings and we need to convert them
  // to numbers to match the TSNs returned by the external taxonomy API.
  const preParseTaxonIdentifiers = taxonIdentifiers.map((item) => {
    const asNumber = Number(item);
    return isNaN(asNumber) ? item : asNumber;
  });

  // Partition the values into tsns (numbers) and scientific names (strings)
  const [tsns, scientificNames] = partition(preParseTaxonIdentifiers, isNumber);

  const uniqueScientificNames = [...new Set(scientificNames.map((name) => name.toLowerCase()))];

  // Fetch the taxons by scientific name in parallel
  const scientificNameTaxons = await Promise.all(
    uniqueScientificNames.map((name) => platformService.getTaxonByScientificName(name))
  );

  // Bulk fetch the taxons by TSN
  const tsnTaxons = await platformService.getTaxonomyByTsns(tsns);

  scientificNameTaxons.forEach((taxon) => {
    if (taxon) {
      taxonMap.set(taxon.scientificName, taxon);
    }
  });

  tsnTaxons.forEach((taxon) => {
    taxonMap.set(taxon.tsn, taxon);
  });

  return taxonMap;
};

export const taxonDependencies = {
  getTaxonMap: getTaxonMapCore
};

export const getTaxonMap = async (
  taxonIdentifiers: Array<string | number>,
  platformService: PlatformService
): Promise<TaxonMap> => {
  return taxonDependencies.getTaxonMap(taxonIdentifiers, platformService);
};

/**
 * Get the TSNs from a taxon map.
 *
 * @param {TaxonMap} taxonMap The taxon map
 * @return {*} {number[]} The list of TSNs
 */
export const getTsnsFromTaxonMap = (taxonMap: TaxonMap) => {
  return [...new Set(Array.from(taxonMap.values()).map((taxon) => taxon.tsn))];
};
