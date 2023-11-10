import { GridSortDirection } from '@mui/x-data-grid/models';
import { AxiosInstance } from 'axios';

export type OrderBy = 'asc' | 'desc';

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
  orderBy?: GridSortDirection;
}

export interface IMeasurementStub {
  taxon_measurement_id: string;
  measurement_name: string;
  min_value?: number;
  max_value?: number;
  unit?: string;
}
const useLookupApi = (axios: AxiosInstance) => {
  const getSelectOptions = async ({ route, param, query, orderBy }: SelectOptionsProps) => {
    const _param = param ? `/${param}` : ``;
    const _query = query ? `&${query}` : ``;
    const { data } = await axios.get<Array<ICbSelectRows | string>>(
      `/api/critter-data/${route}${_param}?format=asSelect${_query}`
    );

    if (!orderBy) {
      return data;
    }

    const getSortValue = (val: string | ICbSelectRows) => (typeof val === 'string' ? val : val.value);

    const sorter = (aValue: string | ICbSelectRows, bValue: string | ICbSelectRows) => {
      return getSortValue(aValue) > getSortValue(bValue) ? -1 : 1;
    };

    return orderBy === 'desc' ? data.sort(sorter) : data.sort(sorter).reverse();
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
