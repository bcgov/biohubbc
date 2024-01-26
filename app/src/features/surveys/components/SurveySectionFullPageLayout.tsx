import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/system/Stack';
import { ProjectContext } from 'contexts/projectContext';
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
  const projectContext = useContext(ProjectContext);

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Stack
      position="relative"
      height="100%"
      overflow="hidden"
      sx={{
        '& .MuiContainer-root': {
          maxWidth: 'none'
        }
      }}>
      <SurveySectionHeader
        data-testid="fullpage-section-header"
        project_id={surveyContext.projectId}
        project_name={projectContext.projectDataLoader.data.projectData.project.project_name}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
        title={pageTitle}
      />

      <Stack
        flexDirection="row"
        gap={1}
        sx={{
          flex: '1 1 auto',
          p: 1,
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
      </Stack>
    </Stack>
  );
};
