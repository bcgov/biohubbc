import { useCallback, useMemo } from 'react';
import { buildUrl } from 'utils/Utils';
import { useQuery } from './useQuery';

interface Redirect {
  redirectUri: string | undefined;
  redirect: () => void;
}

export default function useRedirect(fallback?: string): Redirect {
  const queryParams = useQuery();

  const redirectUri = useMemo(() => (
    queryParams['next']
      ? buildUrl(window.location.origin, decodeURIComponent(queryParams['next']))
      : undefined

  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [queryParams]);

  const redirect = useCallback(() => {
    if (redirectUri) {
      window.location.replace(redirectUri);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redirectUri]);

  return { redirectUri, redirect };
}
