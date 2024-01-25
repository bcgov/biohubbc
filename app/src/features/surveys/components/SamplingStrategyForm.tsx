import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import SurveyBlockSection from './SurveyBlockSection';
import SurveySiteSelectionForm from './SurveySiteSelectionForm';
import SurveyStratumForm from './SurveyStratumForm';

const SamplingStrategyForm = () => {
  const [showStratumForm, setShowStratumForm] = useState<boolean>(false);

  return (
    <>
      <Box component="fieldset">
        <Typography component="legend">Site Selection Strategies</Typography>
        <Box mt={1}>
          <SurveySiteSelectionForm onChangeStratumEntryVisibility={setShowStratumForm} />
        </Box>
      </Box>
      <Collapse in={showStratumForm}>
        <Box component="fieldset" mt={5}>
          <Typography component="legend">Add Stratum</Typography>
          <Typography
            sx={{
              mb: 2
            }}
            variant="body1"
            color="textSecondary">
            Specify strata used when selecting sampling sites, such as high and low elevation.
          </Typography>
          <SurveyStratumForm />
        </Box>
      </Collapse>
      <Box component="fieldset" mt={5}>
        <Typography
          component="legend"
          sx={{
            mb: 0
          }}>
          Add Sampling Site Groups (Optional)
        </Typography>
        <Typography
          sx={{
            mb: 2
          }}
          variant="body1"
          color="textSecondary">
          Specify sampling site groups to later assign sampling sites to, letting you group similar or related sites.
        </Typography>
        <SurveyBlockSection />
      </Box>
    </>
  );
};

export default SamplingStrategyForm;
