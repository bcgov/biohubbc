import { mdiArrowTopRight } from '@mdi/js';
import { Skeleton } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import SpeciesStandardsResults from './SpeciesStandardsResults';

/**
 * Returns species standards page for searching species and viewing lookup values available for selected species.
 * This component handles the data request, then passes the data to its children components.
 *
 * @returns
 */
export const SpeciesStandards = () => {
  const biohubApi = useBiohubApi();

  const standardsDataLoader = useDataLoader((species: IPartialTaxonomy) =>
    biohubApi.standards.getSpeciesStandards(species.tsn)
  );

  return (
    <>
      <SpeciesAutocompleteField
        formikFieldName="tsn"
        label=""
        handleClear={() => {
          standardsDataLoader.clearData();
        }}
        handleSpecies={(value) => {
          if (value) {
            standardsDataLoader.refresh(value);
          }
        }}
      />
      <Box my={2}>
        <LoadingGuard
          isLoading={standardsDataLoader.isLoading}
          isLoadingFallback={
            <Stack gap={2}>
              <Skeleton variant="rectangular" height="30px" width="300px" sx={{ borderRadius: '5px' }} />
              <Divider />
              <Stack gap={1} direction={'row'}>
                <Skeleton variant="rectangular" height="30px" width="160px" sx={{ borderRadius: '5px' }} />
                <Skeleton variant="rectangular" height="30px" width="250px" sx={{ borderRadius: '5px' }} />
              </Stack>
              <Skeleton variant="rectangular" height="56px" sx={{ borderRadius: '5px' }} />
              <Skeleton variant="rectangular" height="56px" sx={{ borderRadius: '5px' }} />
              <Skeleton variant="rectangular" height="56px" sx={{ borderRadius: '5px' }} />
              <Skeleton variant="rectangular" height="56px" sx={{ borderRadius: '5px' }} />
              <Skeleton variant="rectangular" height="56px" sx={{ borderRadius: '5px' }} />
            </Stack>
          }
          isLoadingFallbackDelay={100}
          hasNoData={!standardsDataLoader.data}
          hasNoDataFallback={
            <Box minHeight="200px" display="flex" alignItems="center" justifyContent="center">
              <NoDataOverlay
                title="Search for a Species"
                subtitle="Explore supported data types and formatting guidelines for species"
                icon={mdiArrowTopRight}
              />
            </Box>
          }
          hasNoDataFallbackDelay={100}>
          <SpeciesStandardsResults data={standardsDataLoader.data} />
        </LoadingGuard>
      </Box>
    </>
  );
};
