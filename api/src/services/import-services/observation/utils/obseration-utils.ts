import { TSNMeasurementDictionary } from '../../utils/measurement';
import { TaxonMap } from '../../utils/taxon';

export const getObservationRowTSNGetter = (taxonIdentifier: string | number, taxonMap: TaxonMap): number => {
  return taxonMap.get(taxonIdentifier)?.tsn ?? -1;
};

export const isMeasurementHeader = (header: string, dictionary: TSNMeasurementDictionary) => {
  return dictionary.has(header);
};

export const isEnvironmentHeader = (_header: string) => {
  return true;
};
