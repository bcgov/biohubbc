import { Container, Paper } from '@mui/material';
import PageHeader from 'components/layout/PageHeader';
import SpeciesStandardsForm from './form/SpeciesStandardsForm';
import SpeciesStandardsResults from './view/SpeciesStandardsResults';

const SpeciesStandardsPage = () => {

  const handleSubmit = () => {
    try {
      // const response = await biohubApi.standards.getTaxonStandards(taxonId);
      console.log('');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <PageHeader title="Standards" />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 3 }}>
          <SpeciesStandardsForm handleSubmit={handleSubmit} />
          <SpeciesStandardsResults />
        </Paper>
      </Container>
    </>
  );
};

export default SpeciesStandardsPage;
