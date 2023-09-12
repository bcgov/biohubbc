import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
import { ObservationComponent } from './ObservationComponent';
import { SamplingSiteList } from './sampling-sites/SamplingSiteList';
import { SurveyObservationHeader } from './SurveyObservationHeader';

export const SurveyObservationPage = () => {
  const surveyContext = useContext(SurveyContext);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
      <SurveyObservationHeader surveyName={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name} />

      <Box display="flex" flex="1 1 auto">
        {/* Sampling Site List */}
        <SamplingSiteList />

        {/* Observations Component */}
        <ObservationComponent />
      </Box>
    </Box>
  );
};
