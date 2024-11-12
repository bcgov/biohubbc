import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import SurveyBlockSection from './blocks/SurveyBlockForm';
import SurveyStratumForm from './stratums/SurveyStratumForm';
import SurveySiteSelectionForm from './SurveySiteSelectionForm';
import Stack from '@mui/material/Stack';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';

const SamplingStrategyForm = () => {
  const [showStratumForm, setShowStratumForm] = useState<boolean>(false);

  return (
    <>
      <SurveySiteSelectionForm onChangeStratumEntryVisibility={setShowStratumForm} />
      <Collapse in={showStratumForm}>
        <Box component="fieldset" mt={5}>
        <Stack  direction="row" gap={1} flexGrow={1}>
          <Typography component="legend">Add Stratum</Typography>
          <HelpButtonTooltip content="Strata provide a framework to focus effort and minimize variability. Each stratum is homogeneous within, but distinct from, others."/>
          </Stack>
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
        <Stack  direction="row" gap={1} flexGrow={1}>
        <Typography
          component="legend"
          sx={{
            mb: 0
          }}>
          Add Blocks (optional)
        </Typography>
        <HelpButtonTooltip content="Blocks are defined areas within your study area that enhance structured sampling and reduce variability. As a higher-level organizational unit, blocks contain sampling sites and help distribute sampling effort systematically across a large area, supporting randomization and reducing potential bias."/>
      </Stack>
        <Stack/>
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
