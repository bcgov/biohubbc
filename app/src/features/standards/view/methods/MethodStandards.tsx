import Box from '@mui/material/Box';
import { MethodStandardsResults } from './MethodStandardsResults';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';

/**
 *
 * This component will handle the data request, then pass the data to its children components.
 *
 * @returns
 */


export const MethodStandards = () => {
  const biohubApi = useBiohubApi();

  const methodDataLoader = useDataLoader(() => biohubApi.standards.getMethodStandards());

  useEffect(() => {
    methodDataLoader.load();
  }, [methodDataLoader]);

  return (
    <Box sx={{ mt: 2 }} flex="1 1 auto">
      {methodDataLoader.data && <MethodStandardsResults data={methodDataLoader.data} />}
    </Box>
  );
};
