import Box from '@mui/material/Box';
import { useParams } from 'react-router';
import SamplingBlockEditForm from '../edit/components/SamplingBlockEditForm';
import SamplingBlockForm from './SamplingBlockForm';
import SamplingStratumForm from './SamplingStratumForm';

const SamplingSiteGroupingsForm = () => {
  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveySampleSiteId: number | null = Number(urlParams['survey_sample_site_id']) || null;

  return (
    <>
      {surveySampleSiteId ? <SamplingBlockEditForm /> : <SamplingBlockForm />}
      <Box mt={5}>
        <SamplingStratumForm />
      </Box>
    </>
  );
};

export default SamplingSiteGroupingsForm;
