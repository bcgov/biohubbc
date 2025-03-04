import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useHabitatFeatureTableContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SurveyHabitatFeatureTable } from '../../../../habitat-features/components/SurveyHabitatFeatureTable';

/**
 * Container for the Survey Spatial Habitat Feature Table.
 *
 * @returns {JSX.Element}
 */
export const SurveySpatialHabitatFeatureTableContainer = () => {
  const surveyContext = useSurveyContext();
  const habitatFeatureTableContext = useHabitatFeatureTableContext();

  const biohubApi = useBiohubApi();

  const habitatFeaturesGeometryDataLoader = useDataLoader(() =>
    biohubApi.habitatFeature.getSurveyHabitatFeaturesGeometry(surveyContext.projectId, surveyContext.surveyId)
  );

  habitatFeaturesGeometryDataLoader.load();

  return (
    <LoadingGuard
      isLoading={habitatFeatureTableContext.isLoading}
      isLoadingFallback={
        <Box flex="1 1 auto">
          <SkeletonTable />
        </Box>
      }
      hasNoData={!habitatFeatureTableContext.rows.length}
      hasNoDataFallback={
        <Box flex="1 1 auto">
          <NoDataOverlay
            height="100%"
            title="Add Habitat Features"
            subtitle="Add habitat features that you have observed in the survey area"
            icon={mdiArrowTopRight}
          />
        </Box>
      }>
      <Box flex="1 1 auto" overflow="hidden">
        <SurveyHabitatFeatureTable />
      </Box>
    </LoadingGuard>
  );
};
