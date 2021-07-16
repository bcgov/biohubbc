import { AxiosInstance } from 'axios';
import { ICreatePermitsForm } from 'features/permits/CreatePermitPage';
import { ICreatePermitsResponse, IGetPermitsListResponse } from 'interfaces/usePermitApi.interface';

/**
 * Returns a set of supported api methods for working with permits as their own entities.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const usePermitApi = (axios: AxiosInstance) => {
  /**
   * Get a list of permits
   *
   * @param {AxiosInstance} axios
   * @returns {*} {Promise<IGetPermitsListResponse[]>}
   */
  const getPermitsList = async (): Promise<IGetPermitsListResponse[]> => {
    const { data } = await axios.get(`/api/permits/list`);

    return data;
  };

  /**
   * Create permits (non-sampling).
   *
   * @param {ICreatePermitsForm} permitsData
   * @return {*}  {Promise<ICreatePermitsResponse[]>}
   */
  const createPermits = async (permitsData: ICreatePermitsForm): Promise<ICreatePermitsResponse[]> => {
    const { data } = await axios.post('/api/permits/create', permitsData);

    return data;
  };

  return {
    getPermitsList,
    createPermits
  };
};

export default usePermitApi;
