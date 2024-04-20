import Box from '@mui/material/Box';
import { useParams } from 'react-router';
import SamplingBlockForm from '../create/form/SamplingBlockForm';
import SamplingStratumForm from '../create/form/SamplingStratumForm';
import SamplingBlockEditForm from '../edit/form/SamplingBlockEditForm';
import SamplingStratumEditForm from '../edit/form/SamplingStratumEditForm';

const SamplingSiteGroupingsForm = () => {
  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveySampleSiteId: number | null = Number(urlParams['survey_sample_site_id']) || null;

  return (
    <>
      {surveySampleSiteId ? <SamplingBlockEditForm /> : <SamplingBlockForm />}
      <Box mt={5}>{surveySampleSiteId ? <SamplingStratumEditForm /> : <SamplingStratumForm />}</Box>
    </>
  );
};

export default SamplingSiteGroupingsForm;
