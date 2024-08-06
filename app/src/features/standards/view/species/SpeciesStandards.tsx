import { Skeleton } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IPartialTaxonomy } from 'interfaces/useTaxonomyApi.interface';
import { isDefined } from 'utils/Utils';
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
        label={''}
        handleSpecies={(value) => {
          if (value) {
            standardsDataLoader.refresh(value);
          }
        }}
      />
      <Box my={2}>
        {isDefined(standardsDataLoader.data) ? (
          <SpeciesStandardsResults data={standardsDataLoader.data} isLoading={standardsDataLoader.isLoading} />
        ) : (
          <Stack gap={1}>
            {[...Array(10)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height="60px" />
            ))}
          </Stack>
        )}
      </Box>
    </>
  );
};
