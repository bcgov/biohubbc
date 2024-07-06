import { AxiosInstance } from 'axios';
import { IAllTelemetryAdvancedFilters } from 'features/summary/tabular-data/telemetry/TelemetryListFilterForm';

import { IFindTelemetryResponse } from 'interfaces/useTelemetryApi.interface';
import qs from 'qs';
import { ApiPaginationRequestOptions } from 'types/misc';

/**
 * Returns a set of supported api methods for working with telemetry.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useTelemetryApi = (axios: AxiosInstance) => {
  /**
   * Get telemetry for a system user id.
   *
   * @param {ApiPaginationRequestOptions} [pagination]
   * @param {IAllTelemetryAdvancedFilters} filterFieldData
   * @return {*} {Promise<IGetProjectsListResponse[]>}
   */
  const findTelemetry = async (
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: IAllTelemetryAdvancedFilters
  ): Promise<IFindTelemetryResponse> => {
    const params = {
      ...pagination,
      ...filterFieldData
    };

    const { data } = await axios.get('/api/telemetry', { params, paramsSerializer: (params) => qs.stringify(params) });

    return data;
  };

  return { findTelemetry };
};

export default useTelemetryApi;
