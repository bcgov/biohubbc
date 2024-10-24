import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { SamplingStratumChips } from 'features/surveys/sampling-information/sites/edit/form/SamplingStratumChips';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import { SamplingSiteListMap } from './map/SamplingSiteMap';
import { SamplingSiteListMethod } from './method/SamplingSiteListMethod';

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
  const { surveyId, projectId } = useSurveyContext();

  const sampleSiteDataLoader = useDataLoader(() =>
    biohubApi.samplingSite.getSampleSiteById(projectId, surveyId, surveySampleSiteId)
  );

  useEffect(() => {
    sampleSiteDataLoader.load();
  }, [sampleSiteDataLoader]);

  const sampleSite = sampleSiteDataLoader.data;

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
    <>
      {sampleSite.stratums && sampleSite.stratums.length > 0 && (
        <Box display="flex" alignItems="center" color="textSecondary" py={1} px={1}>
          <SamplingStratumChips stratums={sampleSite.stratums} />
        </Box>
      )}
      <List
        disablePadding
        sx={{
          mx: 1.5,
          '& .MuiListItemText-primary': {
            typography: 'body2',
            pt: 1
          }
        }}>
        {sampleSite.sample_methods?.map((sampleMethod, index) => {
          return (
            <SamplingSiteListMethod
              sampleMethod={sampleMethod}
              key={`${sampleMethod.survey_sample_site_id}-${sampleMethod.survey_sample_method_id}-${index}`}
            />
          );
        })}
      </List>
      <Box height="250px" flex="1 1 auto" mx={1} m={2}>
        <SamplingSiteListMap sampleSite={sampleSite} />
      </Box>
    </>
  );
};
