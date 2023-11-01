import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
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
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box display="flex" flexDirection="column" height="100%" overflow="hidden" position="relative">
      <SurveySectionHeader
        project_id={surveyContext.projectId}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
        title={pageTitle}
      />

      <Divider flexItem></Divider>

      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        sx={{
          flex: '1 1 auto',
          background: '#fff'
        }}>
        <Box flex="0 0 auto" width="400px">
          {sideBarComponent}
        </Box>

        <Box flex="1 1 auto" position="relative">
          {mainComponent}
        </Box>
      </Stack>
    </Box>
  );
};
