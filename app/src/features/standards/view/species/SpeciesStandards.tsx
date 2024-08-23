import { mdiArrowTopRight } from '@mdi/js';
import { Skeleton } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
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
        {standardsDataLoader.data && <SpeciesStandardsResults data={standardsDataLoader.data} />}
        {standardsDataLoader.isLoading ? (
          <Stack gap={1}>
            <Skeleton variant="rectangular" height="60px" />
            <Skeleton variant="rectangular" height="60px" />
            <Skeleton variant="rectangular" height="60px" />
            <Skeleton variant="rectangular" height="60px" />
            <Skeleton variant="rectangular" height="60px" />
            <Skeleton variant="rectangular" height="60px" />
            <Skeleton variant="rectangular" height="60px" />
          </Stack>
        ) : (
          <Box minHeight="200px" display="flex" alignItems="center" justifyContent="center">
            <NoDataOverlay
              title="Search for a Species"
              subtitle="Explore supported data types and formatting guidelines for species"
              icon={mdiArrowTopRight}
            />
          </Box>
        )}
      </Box>
    </>
  );
};
