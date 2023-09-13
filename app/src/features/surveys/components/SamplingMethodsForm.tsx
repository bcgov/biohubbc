import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import SurveyBlockSection from './SurveyBlockSection';
import SurveySiteSelectionForm from './SurveySiteSelectionForm';
import SurveyStratumForm from './SurveyStratumForm';

const SamplingMethodsForm = () => {
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
          <Typography component="legend">Stratums</Typography>
          <Typography
            sx={{
              mb: 2
            }}
            variant="body1"
            color="textSecondary">
            Specify the stratums included in this survey.
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
          Blocks (Optional)
        </Typography>
        <Typography
          sx={{
            mb: 2
          }}
          variant="body1"
          color="textSecondary">
          Specify the sampling blocks included in this survey
        </Typography>
        <SurveyBlockSection />
      </Box>
    </>
  );
};

export default SamplingMethodsForm;
