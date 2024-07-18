import { Box, Container, Paper, ToggleButton, ToggleButtonGroup, Toolbar, Typography } from '@mui/material';
import { styled } from '@mui/system';
import PageHeader from 'components/layout/PageHeader';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { ITaxonomy } from 'interfaces/useTaxonomyApi.interface';
import React, { useState } from 'react';
import SpeciesStandardsResults from './view/SpeciesStandardsResults';

/**
 * Page to display both species and method standards and data capture standards
 *
 * @return {*}
 */

// Custom styled ToggleButton
const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  color: theme.palette.text.primary,
  borderColor: theme.palette.primary.main,
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white
  },
  '&:hover': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.common.primary
  }
}));

const DoubleStandardsPage = () => {
  const [currentTab, setCurrentTab] = useState('');

  const biohubApi = useBiohubApi();
  const standardsDataLoader = useDataLoader((species: ITaxonomy) =>
    biohubApi.standards.getSpeciesStandards(species.tsn)
  );

  const views = [
    { label: 'Species Data & Variables', value: 'SPECIES' },
    { label: 'Data Capture & Methodologies', value: 'METHODS' }
  ];

  return (
    <>
      <PageHeader title="Standards" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper>
          <Toolbar style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
            <div className="MuiContainer-root MuiContainer-maxWidthXl css-yx70ef-MuiContainer-root">
              <Typography variant="h4" sx={{ fontWeight: 'lighter', color: 'white' }}>
                Standards for Species and Methodologies
              </Typography>
            </div>
          </Toolbar>

          <Box py={2} px={3}>
            <ToggleButtonGroup
              value={currentTab}
              onChange={(_event: React.MouseEvent<HTMLElement>, view: any) => setCurrentTab(view)}
              exclusive
              sx={{ mb: 2 }}>
              {views.map((view) => (
                <StyledToggleButton key={view.value} value={view.value}>
                  {view.label}
                </StyledToggleButton>
              ))}
            </ToggleButtonGroup>

            {currentTab === 'SPECIES' && (
              <SpeciesAutocompleteField
                formikFieldName="tsn"
                label={''}
                handleSpecies={(value) => {
                  if (value) {
                    standardsDataLoader.refresh(value);
                  }
                }}
              />
            )}
            {/* This is te bit of code that shoes the results for search bar. Is there a way to make sure this is only showing when currentTab is species? */}
            <SpeciesStandardsResults data={standardsDataLoader.data} isLoading={standardsDataLoader.isLoading} />

            {/* Nothing really going on in this part riht now. Using the search bar to search methodologies in  */}
            {currentTab === 'METHODS' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'lighter' }}>
                  Data Capture & Methodologies Placeholder
                </Typography>
                <Typography variant="body2">
                  This is a placeholder for future functionality related to Data Capture & Methodologies API calls,
                  where ever that might come from (technique_attribute_quantitativ etc)
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default DoubleStandardsPage;
