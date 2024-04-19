import { AxiosInstance } from 'axios';
import qs from 'qs';

export type OrderBy = 'asc' | 'desc';

export interface ICbSelectRows {
  key: string;
  id: string;
  value: string;
}

export interface SelectOptionsProps {
  /**
   * The Critterbase API path to call.
   *
   * Note: The route must be supported by the critterbase-proxy middleware in the api.
   *
   * @example
   * 'lookups/taxon-collection-categories'
   *
   * @type {string}
   * @memberof SelectOptionsProps
   */
  route: string;
  /**
   * Query params to be added to the request.
   *
   * @example
   * {
   *   taxon_id='1234',
   *   category_id='5678'
   * }
   * @type {(Record<string, string | number>)}
   * @memberof SelectOptionsProps
   */
  query?: Record<string, string | number>;
  /**
   * Order the results by the given value.
   *
   * @type {OrderBy}
   * @memberof SelectOptionsProps
   */
  orderBy?: OrderBy;
}

export const useLookupApi = (axios: AxiosInstance) => {
  /**
   * Queries the Critterbase API with `format=asSelect` and returns the results.
   *
   * @param {SelectOptionsProps} options
   * @return {Promise<Array<ICbSelectRows | string>>}
   */
  const getSelectOptions = async (options: SelectOptionsProps): Promise<Array<ICbSelectRows | string>> => {
    const { data } = await axios.get<Array<ICbSelectRows | string>>(`/api/critterbase/${options.route}`, {
      params: { format: 'asSelect', ...options.query },
      paramsSerializer: (params: any) => {
        return qs.stringify(params);
      }
    });

    if (!options.orderBy) {
      return data;
    }

    const getSortValue = (val: string | ICbSelectRows) => (typeof val === 'string' ? val : val.value);

    const sorter = (aValue: string | ICbSelectRows, bValue: string | ICbSelectRows) => {
      return getSortValue(aValue) > getSortValue(bValue) ? -1 : 1;
    };

    return options.orderBy === 'desc' ? data.sort(sorter) : data.sort(sorter).reverse();
  };

  return {
    getSelectOptions
  };
};
