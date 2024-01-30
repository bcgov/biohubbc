import Box from '@mui/material/Box';
import SamplingBlockForm from './SamplingBlockForm';
import SamplingStratumForm from './SamplingStratumForm';
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
