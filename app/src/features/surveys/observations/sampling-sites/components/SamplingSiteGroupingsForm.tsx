import Box from '@mui/material/Box';
import SamplingBlockForm from '../edit/form/SamplingBlockForm';
import SamplingStratumForm from '../edit/form/SamplingStratumForm';

const SamplingSiteGroupingsForm = () => {
  return (
    <>
      <SamplingBlockForm />
      <Box mt={5}>
        <SamplingStratumForm />
      </Box>
    </>
  );
};

export default SamplingSiteGroupingsForm;
