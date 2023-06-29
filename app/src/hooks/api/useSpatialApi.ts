import { AxiosInstance } from 'axios';
import { Feature } from 'geojson';

/**
 * Returns a set of supported api methods for working with spatial information.
 *
 * @param {AxiosInstance} axios
 * @return {*} object whose properties are supported api methods.
 */
const useSpatialApi = (axios: AxiosInstance) => {
  /**
   * Fetch a list of NRM and ENV region names that intersect the provided features.
   *
   * @param {Feature[]} features
   * @return {*}  {Promise<{ regions: { regionName: string; sourceLayer: string }[] }>}
   */
  const getRegions = async (
    features: Feature[]
  ): Promise<{ regions: { regionName: string; sourceLayer: string }[] }> => {
    const { data } = await axios.post('/api/spatial/regions', { features: features });

    return data;
  };

  return {
    getRegions
  };
};

export default useSpatialApi;
