import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { SurveySamplingTabs } from 'features/surveys/view/components/sampling-data/SurveySamplingTabs';
import { useSurveyContext } from 'hooks/useContext';
import { useEffect } from 'react';
import { SurveySamplingHeader } from './SurveySamplingHeader';

export const SurveySamplingContainer = () => {
  const surveyContext = useSurveyContext();

  useEffect(() => {
    surveyContext.sampleSiteDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
    surveyContext.techniqueDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
    // Should not re-run this effect on `samplingSitesDataLoader` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Paper>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
        <SurveySamplingHeader />

        <Divider />

        <SurveySamplingTabs
          techniques={surveyContext.techniqueDataLoader.data}
          sites={surveyContext.sampleSiteDataLoader.data}
        />
      </Box>
    </Paper>
  );
};
