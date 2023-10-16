import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import { SurveyContext } from 'contexts/surveyContext';
import SurveySectionHeader from 'features/surveys/components/SurveySectionHeader';
import React, { useContext } from 'react';
import AnimalList from './AnimalList';

export const SurveyAnimalPage = () => {
  const surveyContext = useContext(SurveyContext);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box display="flex" flexDirection="column" height="100%" overflow="hidden" position="relative">
      <Box
        zIndex={999}
        sx={{
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: grey[300]
        }}>
        <SurveySectionHeader
          project_id={surveyContext.projectId}
          survey_id={surveyContext.surveyId}
          survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
          title={'Manage Animals'}
        />
      </Box>

      <Box display="flex" flex="1 1 auto" overflow="hidden" p={1}>
        {/* Animals List */}
        <Paper
          elevation={0}
          sx={{
            flex: '0 0 auto',
            width: 400,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderRight: '1px solid' + grey[300]
          }}>
          <AnimalList />
        </Paper>

        {/* Marked and Known animals Component */}
        <Paper
          elevation={0}
          sx={{
            flex: '1 1 auto',
            overflow: 'hidden',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0
          }}></Paper>
      </Box>
    </Box>
  );
};
