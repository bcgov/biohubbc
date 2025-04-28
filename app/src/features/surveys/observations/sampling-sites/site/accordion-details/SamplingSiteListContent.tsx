import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { SamplingSiteListPeriodContainer } from 'features/surveys/observations/sampling-sites/site/accordion-details/period/SamplingSiteListPeriodContainer';
import { SamplingStratumChips } from 'features/surveys/sampling-information/sites/edit/form/SamplingStratumChips';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import { SamplingSiteListMap } from './map/SamplingSiteMap';

export interface ISamplingSiteListContentProps {
  surveySampleSiteId: number;
}

/**
 * Renders a list item for a single sampling method.
 *
 * @param {ISamplingSiteListContentProps} props
 * @return {*}
 */
export const SamplingSiteListContent = (props: ISamplingSiteListContentProps) => {
  const { surveySampleSiteId } = props;

  const biohubApi = useBiohubApi();
  const { surveyId } = useSurveyContext();

  const sampleSiteDataLoader = useDataLoader(() =>
    biohubApi.samplingSite.getSampleSiteById(surveyId, surveySampleSiteId)
  );

  const samplePeriodDataLoader = useDataLoader(() =>
    biohubApi.samplingPeriod.findSamplePeriods({
      survey_id: surveyId,
      sample_site_id: [surveySampleSiteId]
    })
  );

  useEffect(() => {
    sampleSiteDataLoader.load();
  }, [sampleSiteDataLoader]);

  useEffect(() => {
    samplePeriodDataLoader.load();
  }, [samplePeriodDataLoader]);

  const sampleSite = sampleSiteDataLoader.data;

  const samplePeriods = samplePeriodDataLoader.data?.periods ?? [];

  if (!sampleSite) {
    return (
      <Stack gap={1} px={1} flex="1 1 auto">
        <Skeleton variant="rectangular" height="40px" sx={{ mx: 3 }}></Skeleton>
        <Skeleton variant="rectangular" height="30px" sx={{ mx: 3, ml: 6 }}></Skeleton>
        <Skeleton variant="rectangular" height="30px" sx={{ mx: 3, ml: 6 }}></Skeleton>
        <Skeleton variant="rectangular" height="150px" sx={{ mx: 3, my: 2 }}></Skeleton>
      </Stack>
    );
  }

  return (
    <Box mb={2} mx={2}>
      {sampleSite.stratums && sampleSite.stratums.length > 0 && (
        <Box display="flex" alignItems="center" color="textSecondary" pb={1}>
          <SamplingStratumChips stratums={sampleSite.stratums} />
        </Box>
      )}
      <List disablePadding sx={{ '& .MuiListItemText-primary': { typography: 'body2' }, pb: 1 }}>
        <SamplingSiteListPeriodContainer samplePeriods={samplePeriods} />
      </List>
      <Box height="250px" flex="1 1 auto">
        <SamplingSiteListMap sampleSite={sampleSite} />
      </Box>
    </Box>
  );
};
