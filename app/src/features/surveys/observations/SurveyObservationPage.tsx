import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
import ObservationComponent from './ObservationComponent';
import SamplingSiteList from './sampling-sites/SamplingSiteList';
import SurveyObservationHeader from './SurveyObservationHeader';

export const SurveyObservationPage = () => {
  const surveyContext = useContext(SurveyContext);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      overflow="hidden"
      position="relative"
      sx={{
        background: '#fff'
      }}>
      <Box
        zIndex={999}
        sx={{
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: grey[300]
        }}>
        <SurveyObservationHeader
          project_id={surveyContext.projectId}
          survey_id={surveyContext.surveyId}
          survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
        />
      </Box>

      <Box display="flex" flex="1 1 auto" overflow="hidden">
        {/* Sampling Site List */}
        <Box
          flex="0 0 auto"
          width={400}
          sx={{
            borderRightStyle: 'solid',
            borderRightWidth: '1px',
            borderRightColor: grey[300]
          }}>
          <SamplingSiteList />
        </Box>

        {/* Observations Component */}
        <Box flex="1 1 auto" overflow="hidden">
          <ObservationComponent />
        </Box>
      </Box>
    </Box>
  );
};
