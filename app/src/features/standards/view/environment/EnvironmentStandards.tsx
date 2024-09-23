import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { debounce } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { EnvironmentStandardsResults } from './EnvironmentStandardsResults';

/**
 * Returns environmental variable lookup values for the standards page
 *
 * @returns
 */
export const EnvironmentStandards = () => {
  const biohubApi = useBiohubApi();

  const environmentsDataLoader = useDataLoader((keyword?: string) =>
    biohubApi.standards.getEnvironmentStandards(keyword)
  );

  const debouncedRefresh = useMemo(
    () =>
      debounce((value: string) => {
        environmentsDataLoader.refresh(value);
      }, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    environmentsDataLoader.load();
  }, [environmentsDataLoader]);

  return (
    <>
      <TextField
        name="name"
        label="Environmental variable name"
        key="environments-name-search"
        fullWidth
        onChange={(event) => {
          const value = event.currentTarget.value;
          debouncedRefresh(value);
        }}
      />
      <Box my={2}>
        <LoadingGuard
          isLoading={environmentsDataLoader.isLoading || !environmentsDataLoader.isReady}
          isLoadingFallback={
            <Stack gap={2}>
              <Skeleton variant="rectangular" height="56px" sx={{ borderRadius: '5px' }} />
              <Skeleton variant="rectangular" height="56px" sx={{ borderRadius: '5px' }} />
              <Skeleton variant="rectangular" height="56px" sx={{ borderRadius: '5px' }} />
              <Skeleton variant="rectangular" height="56px" sx={{ borderRadius: '5px' }} />
              <Skeleton variant="rectangular" height="56px" sx={{ borderRadius: '5px' }} />
            </Stack>
          }
          isLoadingFallbackDelay={100}
          hasNoData={!environmentsDataLoader.data && environmentsDataLoader.isReady}
          hasNoDataFallback={
            <Box minHeight="200px" display="flex" alignItems="center" justifyContent="center">
              <Typography color="textSecondary">No environment standards found</Typography>
            </Box>
          }
          hasNoDataFallbackDelay={100}>
          <EnvironmentStandardsResults data={environmentsDataLoader.data} />
        </LoadingGuard>
      </Box>
    </>
  );
};
