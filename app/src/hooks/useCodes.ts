import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { useBiohubApi } from './useBioHubApi';
import useDataLoader, { DataLoader } from './useDataLoader';

/**
 * Hook that fetches app code sets.
 *
 * @export
 * @return {*}  {DataLoader<IGetAllCodeSetsResponse>}
 */
export default function useCodes(): DataLoader<IGetAllCodeSetsResponse> {
  const api = useBiohubApi();

  return useDataLoader<IGetAllCodeSetsResponse>(api.codes.getAllCodeSets);
}
