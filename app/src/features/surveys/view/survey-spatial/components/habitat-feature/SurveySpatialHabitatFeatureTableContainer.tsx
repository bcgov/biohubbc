import Box from '@mui/material/Box';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { SurveyHabitatFeatureTable } from 'features/surveys/habitat-features/components/tables/SurveyHabitatFeatureTable';
import { useHabitatFeatureTableContext } from 'hooks/useContext';

/**
 * Container for the Survey Spatial Habitat Feature Table.
 *
 * @return {*}
 */
export const SurveySpatialHabitatFeatureTableContainer = () => {
  const habitatFeatureTableContext = useHabitatFeatureTableContext();

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
            title="Habitat Features"
            subtitle="Add habitat features that you have observed in the survey area. Habitat features that belong to the surveys in this collection will show here."
          />
        </Box>
      }>
      <SurveyHabitatFeatureTable />
    </LoadingGuard>
  );
};
