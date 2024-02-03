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

// TODO finalize this type. Combine with above?
export type Measurement = {
  uuid: string;
  scientificName: string;
  commonName?: string;
  measurementId: number;
  measurementName: string;
  measurementType?: string;
  measurementDescription: string;
};

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

  /**
   * Get measurements by search terms.
   *
   * TODO: Implement this method.
   *
   * @param {string[]} searchTerms
   * @return {*}  {Measurement[]}
   */
  const getMeasurementsBySearachTerms = async (searchTerms: string[]): Promise<Measurement[]> => {
    return [
      {
        uuid: '930f2b50-84b7-4fb5-a956-15c5152cf388',
        scientificName: 'scientificName 1',
        commonName: 'commonName 1',
        measurementId: 1,
        measurementName: 'measurementName 1',
        measurementDescription: 'measurementDescription 1'
      },
      {
        uuid: '6004651d-a6c5-4e04-ab46-8dcce1d1e124',
        scientificName: 'scientificName 2',
        commonName: 'commonName 2',
        measurementId: 2,
        measurementName: 'measurementName 2',
        measurementDescription: 'measurementDescription 2'
      },
      {
        uuid: 'bbc7a940-ab8a-4977-8995-e56d2dda5d60',
        scientificName: 'scientificName 3',
        commonName: 'commonName 3',
        measurementId: 3,
        measurementName: 'measurementName 3',
        measurementDescription: 'measurementDescription 3'
      }
    ];
  };

  return {
    getSelectOptions,
    getTaxonMeasurements,
    getTaxonMarkingBodyLocations,
    getMeasurementsBySearachTerms
  };
};

export { useLookupApi };
