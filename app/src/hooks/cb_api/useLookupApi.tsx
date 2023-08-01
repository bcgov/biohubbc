import { AxiosInstance } from 'axios';

interface ICbSelectRows {
  key: string;
  id: string;
  value: string;
}

export type ICbRouteKey =
  | 'region_env'
  | 'region_nr'
  | 'colours'
  | 'wmu'
  | 'cod'
  | 'sex'
  | 'marking_materials'
  | 'marking_type'
  | 'collection_category'
  | 'critter_status'
  | 'cause_of_death_confidence'
  | 'coordinate_uncertainty_unit'
  | 'frequency_units'
  | 'measurement_units'
  | 'supported_systems'
  | 'taxons'
  | 'species'
  | 'collection_units'
  | 'taxon_collection_categories'
  | 'taxon_marking_body_locations'
  | 'taxon_qualitative_measurements'
  | 'taxon_quantitative_measurements';

type ICbRoutes = Record<ICbRouteKey, string>;
const lookups = '/api/lookups';
const xref = '/api/xref';
const lookupsEnum = lookups + '/enum';
const lookupsTaxons = lookups + '/taxons';
const CbRoutes: ICbRoutes = {
  // lookups
  region_env: `${lookups}/region-envs`,
  region_nr: `${lookups}/region-nrs`,
  wmu: `${lookups}/wmus`,
  cod: `${lookups}/cods`,
  marking_materials: `${lookups}/marking-materials`,
  marking_type: `${lookups}/marking-types`,
  collection_category: `${lookups}/collection-unit-categories`,
  taxons: lookupsTaxons,
  species: `${lookupsTaxons}/species`,
  colours: `${lookups}/colours`,

  // lookups/enum
  sex: `${lookupsEnum}/sex`,
  critter_status: `${lookupsEnum}/critter-status`,
  cause_of_death_confidence: `${lookupsEnum}/cod-confidence`,
  coordinate_uncertainty_unit: `${lookupsEnum}/coordinate-uncertainty-unit`,
  frequency_units: `${lookupsEnum}/frequency-units`,
  measurement_units: `${lookupsEnum}/measurement-units`,
  supported_systems: `${lookupsEnum}/supported-systems`,

  // xref
  collection_units: `${xref}/collection-units`,

  // taxon xrefs
  taxon_qualitative_measurements: `${xref}/taxon-quantitative-measurements`,
  taxon_quantitative_measurements: `${xref}/taxon-qualitative-measurements`,
  taxon_collection_categories: `${xref}/taxon-collection-categories`,
  taxon_marking_body_locations: `${xref}/taxon-marking-body-locations`
};

const useLookupApi = (axios: AxiosInstance) => {
  const getSelectOptions = async (route: ICbRouteKey, taxon_id?: string): Promise<Array<ICbSelectRows | string>> => {
    const byTaxon = taxon_id ? `&taxon_id=${taxon_id}` : ``;
    const { data } = await axios.get(`${CbRoutes[route]}?format=asSelect${byTaxon}`);
    return data;
  };

  return {
    getSelectOptions
  };
};

export { useLookupApi };
