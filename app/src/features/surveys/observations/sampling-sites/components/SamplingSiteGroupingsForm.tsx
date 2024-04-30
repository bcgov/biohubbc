import Box from '@mui/material/Box';
import SamplingBlockEditForm from '../edit/form/SamplingBlockEditForm';
import SamplingStratumEditForm from '../edit/form/SamplingStratumEditForm';

const SamplingSiteGroupingsForm = () => {
  return (
    <>
      <SamplingBlockEditForm />
      <Box mt={5}>
        <SamplingStratumEditForm />
      </Box>
    </>
  );
};

export default SamplingSiteGroupingsForm;
