import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { useEffect, useState } from 'react';
import { useBiohubApi } from './useBioHubApi';

export interface IUseCodes {
  codes: IGetAllCodeSetsResponse | undefined;
  isLoading: boolean;
  isReady: boolean;
}

/**
 * Hook that fetches app code sets.
 *
 * @export
 * @return {*}  {IUseCodes}
 */
export default function useCodes(): IUseCodes {
  const api = useBiohubApi();

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    const fetchCodes = async () => {
      setIsLoading(true);

      const response = await api.codes.getAllCodeSets();

      setCodes(response);

      setIsReady(true);
    };

    if (codes) {
      return;
    }

    fetchCodes();
  }, [api.codes, codes]);

  return { codes, isLoading, isReady };
}
