import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { useHabitatFeatureTableContext } from 'hooks/useContext';
import { SurveyHabitatFeatureTable } from '../../../../habitat-features/components/tables/SurveyHabitatFeatureTable';

/**
 * Container for the Survey Spatial Habitat Feature Table.
 *
 * @returns {JSX.Element}
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
