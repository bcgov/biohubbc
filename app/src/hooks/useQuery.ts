import qs from 'qs';
import { useLocation } from 'react-router';

/**
 * Convenience wrapper for `useLocation` that parses `location.search` into an object of query string values.
 *
 * @return {*}
 */
export const useQuery = () => {
  const location = useLocation();
  return qs.parse(location.search.replace('?', '')) as any;
};
