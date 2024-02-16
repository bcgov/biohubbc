import Box from '@mui/material/Box';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
import SamplingBlockForm from './SamplingBlockForm';
import SamplingStratumForm from './SamplingStratumForm';

const SamplingSiteGroupingsForm = () => {
  const surveyContext = useContext(SurveyContext);

  const existingBlocks = surveyContext.sampleSiteDataLoader.data?.sampleSites?.map((item) => item.sample_blocks) || [];

  console.log(existingBlocks)

  console.log(existingBlocks);

  return (
    <>
      <SamplingBlockForm blocks={existingBlocks} />
      <Box mt={5}>
        <SamplingStratumForm />
      </Box>
    </>
  );
};

export default SamplingSiteGroupingsForm;
