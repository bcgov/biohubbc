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
        <Typography component="legend">Site Selection Strategy</Typography>
        <Box mt={1}>
          <SurveySiteSelectionForm onChangeStratumEntryVisibility={setShowStratumForm} />
        </Box>
      </Box>
      <Collapse in={showStratumForm}>
        <Box component="fieldset" mt={5}>
          <Typography component="legend">Define Stratums</Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            sx={{
              maxWidth: '72ch'
            }}>
            Enter a name and description for each stratum used in this survey.
          </Typography>
          <Box mt={1}>
            <SurveyStratumForm />
          </Box>
        </Box>
      </Collapse>
      <Box component="fieldset" mt={5}>
        <SurveyBlockSection />
      </Box>
    </>
  );
};

export default SamplingMethodsForm;
