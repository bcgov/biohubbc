import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { AxiosInstance } from 'axios';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import useAxios from 'hooks/api/useAxios';
import { useMarkingApi } from 'hooks/cb_api/useMarkingApi';
import useDataLoader from 'hooks/useDataLoader';
import { IMarkingColourOption, IMarkingTypeResponse } from 'interfaces/useMarkingApi.interface';
import { MarkingStandardsResults } from './MarkingStandardsResults';

export const MarkingStandards = () => {
  const axiosInstance: AxiosInstance = useAxios();
  const markingApi = useMarkingApi(axiosInstance);

  const markingsDataLoader = useDataLoader(async () => {
    console.log('Fetching marking standards data...');
    try {
      const markingTypes: IMarkingTypeResponse[] = await markingApi.getMarkingTypeOptions();
      const markingColours: IMarkingColourOption[] = await markingApi.getMarkingColourOptions();

      console.log('Marking Types:', markingTypes);
      console.log('Marking Colours:', markingColours);

      return {
        markingTypes,
        markingColours,
        transformedMarkingTypes: markingTypes.map((item: IMarkingTypeResponse) => ({
          value: item.marking_type_id,
          label: item.name
        })),
        transformedMarkingColours: markingColours.map((item: IMarkingColourOption) => ({
          value: item.colour_id,
          label: item.colour
        }))
      };
    } catch (error) {
      console.error('Failed to fetch marking data:', error);
      return { markingTypes: [], markingColours: [] };
    }
  });

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
          !(markingsDataLoader.data?.markingTypes.length || markingsDataLoader.data?.markingColours.length) &&
          markingsDataLoader.isReady
        }
        hasNoDataFallback={
          <Box minHeight="200px" display="flex" alignItems="center" justifyContent="center">
            <Typography color="textSecondary">No marking standards found</Typography>
          </Box>
        }>
        <MarkingStandardsResults data={markingsDataLoader.data} />
      </LoadingGuard>
    </Box>
  );
};
