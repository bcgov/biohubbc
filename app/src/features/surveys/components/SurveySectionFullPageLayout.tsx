import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import { SurveyContext } from 'contexts/surveyContext';
import React, { useContext } from 'react';
import SurveySectionHeader from '../components/SurveySectionHeader';

interface SurveySectionFullPageLayoutProps {
  sideBarComponent: JSX.Element;
  mainComponent: JSX.Element;
  pageTitle: string;
}

export const SurveySectionFullPageLayout = (props: SurveySectionFullPageLayoutProps) => {
  const { sideBarComponent, mainComponent, pageTitle } = props;
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
          title={pageTitle}
        />
      </Box>

      <Box display="flex" flex="1 1 auto" overflow="hidden" p={1}>
        {/* Sidebar Component */}
        <Paper
          elevation={0}
          sx={{
            flex: '0 0 auto',
            width: 400,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            borderRight: '1px solid' + grey[300]
          }}>
          {sideBarComponent}
        </Paper>

        {/* Main content Component */}
        <Paper
          elevation={0}
          sx={{
            flex: '1 1 auto',
            overflow: 'hidden',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0
          }}>
          {mainComponent}
        </Paper>
      </Box>
    </Box>
  );
};
