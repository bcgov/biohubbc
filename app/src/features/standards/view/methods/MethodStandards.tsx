import { Skeleton, Stack, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { debounce } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { MethodStandardsResults } from './MethodStandardsResults';

/**
 *
 * Returns information about method lookup options
 *
 * @returns
 */
export const MethodStandards = () => {
  const biohubApi = useBiohubApi();

  const methodDataLoader = useDataLoader((keyword?: string) => biohubApi.standards.getMethodStandards(keyword));

  const debouncedRefresh = useMemo(
    () =>
      debounce((value: string) => {
        methodDataLoader.refresh(value);
      }, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    methodDataLoader.load();
  }, [methodDataLoader]);

  return (
    <>
      <TextField
        name="name"
        label="Method name"
        key="method-name-search"
        fullWidth
        onChange={(event) => {
          const value = event.currentTarget.value;
          debouncedRefresh(value);
        }}
      />
      <Box my={2}>
        <LoadingGuard
          isLoading={methodDataLoader.isLoading || !methodDataLoader.isReady}
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
          hasNoData={!methodDataLoader.data?.length && methodDataLoader.isReady}
          hasNoDataFallback={
            <Box minHeight="200px" display="flex" alignItems="center" justifyContent="center">
              <Typography color="textSecondary">No method standards found</Typography>
            </Box>
          }
          hasNoDataFallbackDelay={100}>
          <MethodStandardsResults data={methodDataLoader.data ?? []} />
        </LoadingGuard>
      </Box>
    </>
  );
};
