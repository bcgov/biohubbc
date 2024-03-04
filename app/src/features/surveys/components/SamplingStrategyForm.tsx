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
        <SurveySiteSelectionForm onChangeStratumEntryVisibility={setShowStratumForm} />
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
            Specify each stratum used when selecting sampling sites.
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
          Add Blocks (Optional)
        </Typography>
        <Typography
          sx={{
            mb: 2
          }}
          variant="body1"
          color="textSecondary">
          If required, specify each block included in this survey.
        </Typography>
        <SurveyBlockSection />
      </Box>
    </>
  );
};

export default SamplingStrategyForm;
