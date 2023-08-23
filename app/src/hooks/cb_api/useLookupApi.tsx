import { AxiosInstance } from 'axios';

export interface ICbSelectRows {
  key: string;
  id: string;
  value: string;
}

const lookups = '/api/lookups';
const xref = '/api/xref';
const lookupsEnum = lookups + '/enum';
const lookupsTaxons = lookups + '/taxons';
const CbRoutes = {
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
  taxon_qualitative_measurements: `${xref}/taxon-qualitative-measurements`,
  taxon_qualitative_measurement_options: `${xref}/taxon-qualitative-measurement-options`,
  taxon_quantitative_measurements: `${xref}/taxon-quantitative-measurements`,
  taxon_collection_categories: `${xref}/taxon-collection-categories`,
  taxon_marking_body_locations: `${xref}/taxon-marking-body-locations`
} as const;

export type ICbRouteKey = keyof typeof CbRoutes;

interface SelectOptionsProps {
  route: ICbRouteKey;
  param?: string;
  query?: string;
  asSelect?: boolean;
}

export interface IMeasurementStub {
  taxon_measurement_id: string;
  measurement_name: string;
  min_value?: number;
  max_value?: number;
  unit?: string;
}
export interface IMarkingStub {
  taxon_marking_body_location_id: string;
  body_location: string;
  taxon_id: string;
}

const useLookupApi = (axios: AxiosInstance) => {
  const getSelectOptions = async ({
    route,
    param,
    query
  }: SelectOptionsProps): Promise<Array<ICbSelectRows | string>> => {
    const _param = param ? `/${param}` : ``;
    const _query = query ? `&${query}` : ``;

    const { data } = await axios.get(`${CbRoutes[route]}${_param}?format=asSelect${_query}`);

    return data;
  };

  const getTaxonMeasurements = async (taxon_id?: string): Promise<Array<IMeasurementStub> | undefined> => {
    if (!taxon_id) {
      return;
    }
    const { data } = await axios.get(`${CbRoutes.taxon_measurements}?taxon_id=${taxon_id}`);
    return data;
  };

  const getTaxonMarkingBodyLocations = async (taxon_id?: string): Promise<Array<IMarkingStub> | undefined> => {
    if (!taxon_id) {
      return;
    }
    const { data } = await axios.get(`${CbRoutes.taxon_marking_body_locations}?taxon_id=${taxon_id}`);
    return data;
  };

  return {
    getSelectOptions,
    getTaxonMeasurements,
    getTaxonMarkingBodyLocations
  };
};

export { useLookupApi };
