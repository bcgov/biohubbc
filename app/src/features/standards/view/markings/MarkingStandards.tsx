import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import { MarkingStandardsResults } from './MarkingStandardsResults';

export const MarkingStandards = () => {
  const biohubApi = useBiohubApi();

  const markingsDataLoader = useDataLoader((keyword?: string) => biohubApi.standards.getMarkingsStandards(keyword));

  useEffect(() => {
    markingsDataLoader.load();
  }, [markingsDataLoader]);

  if (!markingsDataLoader.data) {
    return <></>;
  }

  return (
    <Box my={2}>
      <LoadingGuard
        isLoading={markingsDataLoader.isLoading || !markingsDataLoader.isReady}
        isLoadingFallback={
          <Stack gap={2}>
            <Skeleton variant="rectangular" height="56px" sx={{ borderRadius: '5px' }} />
            <Skeleton variant="rectangular" height="56px" sx={{ borderRadius: '5px' }} />
          </Stack>
        }
        hasNoData={
          !(markingsDataLoader.data?.types.length || markingsDataLoader.data?.colours.length) &&
          markingsDataLoader.isReady
        }
        hasNoDataFallback={
          <Box minHeight="200px" display="flex" alignItems="center" justifyContent="center">
            <Typography color="textSecondary">No marking standards found</Typography>
          </Box>
        }>
        <MarkingStandardsResults standards={markingsDataLoader.data} />
      </LoadingGuard>
    </Box>
  );
};
