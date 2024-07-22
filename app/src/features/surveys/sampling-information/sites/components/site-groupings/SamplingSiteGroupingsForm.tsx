import Box from '@mui/material/Box';
import { SamplingBlockForm } from 'features/surveys/sampling-information/sites/components/site-groupings/SamplingBlockForm';
import { SamplingStratumForm } from 'features/surveys/sampling-information/sites/components/site-groupings/SamplingStratumForm';

/**
 * Renders a sampling site grouping for related forms.
 *
 * @returns {*}
 */
export const SamplingSiteGroupingsForm = () => {
  return (
    <>
      <SamplingBlockForm />
      <Box mt={5}>
        <SamplingStratumForm />
      </Box>
    </>
  );
};
