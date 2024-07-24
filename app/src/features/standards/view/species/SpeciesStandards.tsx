import Box from '@mui/material/Box';
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
    <Box flex="1 1 auto">
      <SpeciesAutocompleteField
        formikFieldName="tsn"
        label={''}
        handleSpecies={(value) => {
          if (value) {
            standardsDataLoader.refresh(value);
          }
        }}
      />
      {isDefined(standardsDataLoader.data) && (
        <Box my={2}>
          <SpeciesStandardsResults data={standardsDataLoader.data} isLoading={standardsDataLoader.isLoading} />
        </Box>
      )}
    </Box>
  );
};
