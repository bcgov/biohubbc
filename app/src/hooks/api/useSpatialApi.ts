import { AxiosInstance } from 'axios';
import { Feature } from 'geojson';

export type RegionDetails = { regionName: string; sourceLayer: string };
export type GetRegionsResponse = { regions: RegionDetails[] };

/**
 * Returns a set of supported api methods for working with spatial information.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSpatialApi = (axios: AxiosInstance) => {
  /**
   * Fetch a list of BCGW region names that intersect the provided features.
   *
   * @param {Feature[]} features
   * @return {*}  {Promise<{ regions: GetRegionsResponse[] }>}
   */
  const getRegions = async (features: Feature[]): Promise<GetRegionsResponse> => {
    const { data } = await axios.post('/api/spatial/regions', { features: features });

    return data;
  };

  return {
    getRegions
  };
};

export default useSpatialApi;
