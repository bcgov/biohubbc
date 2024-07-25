import Box from '@mui/material/Box';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import { EnvironmentStandardsResults } from './EnvironmentStandardsResults';

/**
 * Returns environmental variable lookup values for the standards page
 *
 * @returns
 */
export const EnvironmentStandards = () => {
  const biohubApi = useBiohubApi();

  const environmentDataLoader = useDataLoader(() => biohubApi.standards.getEnvironmentStandards());

  useEffect(() => {
    environmentDataLoader.load();
  }, [environmentDataLoader]);

  return (
    <Box flex="1 1 auto">
      {environmentDataLoader.data && <EnvironmentStandardsResults data={environmentDataLoader.data} />}
    </Box>
  );
};
