import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/system/Stack';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
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
    return <CircularProgress data-testid="fullpage-spinner" className="pageProgress" size={40} />;
  }

  return (
    <Box display="flex" flexDirection="column" height="100%" overflow="hidden" position="relative">
      <SurveySectionHeader
        data-testid="fullpage-section-header"
        project_id={surveyContext.projectId}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
        title={pageTitle}
      />

      <Divider flexItem></Divider>

      <Paper
        component={Stack}
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        sx={{
          flex: '1 1 auto',
          m: 1,
          overflow: 'hidden'
        }}>
        <Box
          sx={{
            flex: '0 0 auto',
            position: 'relative',
            width: '400px'
          }}>
          {sideBarComponent}
        </Box>

        <Box
          sx={{
            flex: '1 1 auto',
            position: 'relative'
          }}>
          {mainComponent}
        </Box>
      </Paper>
    </Box>
  );
};
