import { AxiosInstance } from 'axios';

export interface ICbSelectRows {
  key: string;
  id: string;
  value: string;
}

//export type ICbRouteKey = keyof typeof CbRoutes;

interface SelectOptionsProps {
  route: string;
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
const useLookupApi = (axios: AxiosInstance) => {
  const getSelectOptions = async ({
    route,
    param,
    query
  }: SelectOptionsProps): Promise<Array<ICbSelectRows | string>> => {
    const _param = param ? `/${param}` : ``;
    const _query = query ? `&${query}` : ``;
    const { data } = await axios.get(`/api/critter-data/${route}${_param}?format=asSelect${_query}`);

    return data;
  };

  const getTaxonMeasurements = async (taxon_id?: string): Promise<Array<IMeasurementStub> | undefined> => {
    if (!taxon_id) {
      return;
    }
    const { data } = await axios.get(`/api/critter-data/xref/taxon-measurements?taxon_id=${taxon_id}`);
    return data;
  };

  const getTaxonMarkingBodyLocations = async (taxon_id?: string): Promise<Array<ICbSelectRows>> => {
    if (!taxon_id) {
      return [];
    }
    const { data } = await axios.get(`/api/critter-data/xref/taxon-marking-body-locations?taxon_id=${taxon_id}`);
    return data;
  };

  return {
    getSelectOptions,
    getTaxonMeasurements,
    getTaxonMarkingBodyLocations
  };
};

export { useLookupApi };
