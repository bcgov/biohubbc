import { Box, Container, Paper, Toolbar, Typography } from '@mui/material';
import PageHeader from 'components/layout/PageHeader';
import SpeciesStandardsForm from './form/SpeciesStandardsForm';

/**
 * Page to display species standards, which describes what data can be entered and in what structure
 *
 * @return {*}
 */
const SpeciesStandardsPage = () => {
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
            <SpeciesStandardsForm />
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default SpeciesStandardsPage;
