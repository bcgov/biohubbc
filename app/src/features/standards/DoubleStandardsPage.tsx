import React, { useState } from 'react';
import { Box, Container, Paper, Toolbar, Typography, Tabs, Tab } from '@mui/material';
import PageHeader from 'components/layout/PageHeader';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import SpeciesStandardsResults from './view/SpeciesStandardsResults';

/**
 * Page to display species standards and data capture standards
 *
 * @return {*}
 */
const DoubleStandardsPage = () => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.ChangeEvent<unknown>, newValue: number) => {
    setCurrentTab(newValue);
  };

  const biohubApi = useBiohubApi();
  const standardsDataLoader = useDataLoader((species: ITaxonomy) =>
    biohubApi.standards.getSpeciesStandards(species.tsn)
  );

  return (
    <>
      <PageHeader title="Standards" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper>
          <Toolbar style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
            <Box sx={{ backgroundColor: 'primary.main', padding: 2, borderRadius: 4, width: 'auto', textAlign: 'centre' }}>
              <Typography variant="h4" sx={{ fontWeight: 'lighter', color: 'white' }}>
                Standards for Species and Methodologies
              </Typography>
            </Box>
          </Toolbar>
          
          <Box py={2} px={3}>
            <Tabs value={currentTab} onChange={handleTabChange} aria-label="standards tabs">
              <Tab label="Species Data & Variables" />
              <Tab label="Data Capture & Methodologies" />
            </Tabs>
            {currentTab === 0 && (
                <Box mt={2}>
                  <SpeciesAutocompleteField
                    formikFieldName="tsn"
                    label={''}
                    handleSpecies={(value) => {
                      if (value) {
                        standardsDataLoader.refresh(value);
                      }
                    }}
                  />
                  <SpeciesStandardsResults data={standardsDataLoader.data} isLoading={standardsDataLoader.isLoading} />
              </Box>
            )}
            {currentTab === 1 && (
              <Box mt={2}>
                <SpeciesAutocompleteField
                  formikFieldName="tsn"
                  label={''}
                  handleSpecies={(value) => {
                    if (value) {
                      standardsDataLoader.refresh(value);
                    }
                  }}
                />
                <SpeciesStandardsResults data={standardsDataLoader.data} isLoading={standardsDataLoader.isLoading} />
              </Box>

          )}
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default DoubleStandardsPage;
