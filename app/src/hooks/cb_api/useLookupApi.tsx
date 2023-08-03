import { AxiosInstance } from 'axios';

export interface ICbSelectRows {
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
  | 'taxon_measurements'
  | 'taxon_quantitative_measurements'
  | 'taxon_qualitative_measurements'
  | 'taxon_qualitative_measurement_options';

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
  taxon_measurements: `${xref}/taxon-measurements`,
  taxon_qualitative_measurements: `${xref}/taxon-quantitative-measurements`,
  taxon_qualitative_measurement_options: `${xref}/taxon-qualitative-measurement-options`,
  taxon_quantitative_measurements: `${xref}/taxon-qualitative-measurements`,
  taxon_collection_categories: `${xref}/taxon-collection-categories`,
  taxon_marking_body_locations: `${xref}/taxon-marking-body-locations`
};

const useLookupApi = (axios: AxiosInstance) => {
  const getSelectOptions = async <T extends ICbSelectRows | string>(
    route: ICbRouteKey,
    param?: string,
    query?: string
  ): Promise<Array<T>> => {
    const _param = param ? `/${param}` : ``;
    const _query = query ? `&${query}` : ``;
    const { data } = await axios.get(`${CbRoutes[route]}${_param}?format=asSelect${_query}`);
    return data;
  };

  return {
    getSelectOptions
  };
};

export { useLookupApi };
