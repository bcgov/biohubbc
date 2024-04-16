import { Box, Container, Paper, Toolbar, Typography } from '@mui/material';
import PageHeader from 'components/layout/PageHeader';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import SpeciesStandardsResults from './view/SpeciesStandardsResults';

/**
 * Page to display species standards, which describes what data can be entered and in what structure
 *
 * @return {*}
 */
const SpeciesStandardsPage = () => {
  const biohubApi = useBiohubApi();
  const standardsDataLoader = useDataLoader((species: ITaxonomy) =>
    biohubApi.standards.getSpeciesStandards(species.tsn)
  );

  return (
    <>
      <PageHeader title="Standards" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper>
          <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h4" component="h2">
              Discover data standards for species
            </Typography>
          </Toolbar>
          <Box py={2} px={3}>
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
              <SpeciesStandardsResults data={standardsDataLoader.data} isLoading={standardsDataLoader.isLoading} />
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default SpeciesStandardsPage;
