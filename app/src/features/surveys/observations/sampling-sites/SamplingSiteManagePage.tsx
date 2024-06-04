import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useProjectContext, useSurveyContext } from 'hooks/useContext';
import SamplingSiteManageHeader from './SamplingSiteManageHeader';
import SamplingSiteManageSiteList from './SamplingSiteManageSiteList';
import SamplingSiteTechniqueContainer from '../../technique/SamplingTechniqueContainer';

const SamplingSiteManagePage = () => {
  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();
  return (
    <Stack
      sx={{
        '& .MuiContainer-root': {
          maxWidth: 'none'
        }
      }}>
      <SamplingSiteManageHeader
        project_id={surveyContext.projectId}
        project_name={projectContext.projectDataLoader.data?.projectData.project.project_name ?? ''}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name ?? ''}
      />

      <Container maxWidth={'xl'} sx={{ py: { xs: 2, sm: 3 } }}>
        <Paper sx={{ mb: 3 }}>
          <SamplingSiteTechniqueContainer />
        </Paper>
        <Paper>
          <SamplingSiteManageSiteList />
        </Paper>
      </Container>
    </Stack>
  );
};

export default SamplingSiteManagePage;
