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

export type MeasurementOption = {
  value: string;
  label: string;
};

// TODO finalize this type based on actual Critterbase values. Combine with above `IMeasurementStub`?
export type Measurement = {
  uuid: string;
  scientificName: string;
  commonName?: string;
  measurementId: number;
  measurementName: string;
  measurementType: 'Quantitative' | 'Qualitative';
  measurementDescription: string;
} & (
  | { measurementType: 'Quantitative'; measurementOptions?: MeasurementOption[] }
  | { measurementType: 'Qualitative'; measurementOptions: MeasurementOption[] }
);

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
    // TODO: this needs to be updated when itis_tsn is swapped over in critter base
    const { data } = await axios.get(`/api/critterbase/xref/taxon-measurements`);

    return data.map((item: any, index: number) => {
      return {
        uuid: item.taxon_measurement_id,
        scientificName: '',
        commonName: '',
        measurementId: index,
        measurementType: 'Quantitative',
        measurementName: item.measurement_name,
        measurementDescription: item.measurement_desc ?? ''
      };
    });
  };

  return {
    getSelectOptions,
    getTaxonMeasurements,
    getTaxonMarkingBodyLocations,
    getMeasurementsBySearachTerms
  };
};

export { useLookupApi };
