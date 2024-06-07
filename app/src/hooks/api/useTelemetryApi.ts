import { AxiosInstance } from 'axios';
import { ITelemetryAdvancedFilters } from 'features/summary/tabular-data/telemetry/TelemetryListContainer';
import { IGetTelemetryListResponse } from 'interfaces/useTelemetryApi.interface';
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
   * @param {ITelemetryAdvancedFilters} filterFieldData
   * @return {*} {Promise<IGetProjectsListResponse[]>}
   */
  const getTelemetryList = async (
    pagination?: ApiPaginationRequestOptions,
    filterFieldData?: ITelemetryAdvancedFilters
  ): Promise<IGetTelemetryListResponse> => {
    const params = new URLSearchParams();

    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('limit', pagination.limit.toString());
      if (pagination.sort) {
        params.append('sort', pagination.sort);
      }
      if (pagination.order) {
        params.append('order', pagination.order);
      }
    }

    if (filterFieldData) {
      Object.entries(filterFieldData).forEach(([key, value]) => {
        params.append(key, value);
      });
    }

    const urlParamsString = `?${params.toString()}`;

    const { data } = await axios.get(`/api/telemetry${urlParamsString}`);

    return data;
  };
  return { getTelemetryList };
};

export default useTelemetryApi;
