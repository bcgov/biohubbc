import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { SamplingSiteManageHeader } from 'features/surveys/sampling-information/manage/SamplingSiteManageHeader';
import { SamplingSiteManageSiteList } from 'features/surveys/sampling-information/sites/manage/SamplingSiteManageSiteList';
import { SamplingTechniqueContainer } from 'features/surveys/sampling-information/techniques/SamplingTechniqueContainer';
import { useProjectContext, useSurveyContext } from 'hooks/useContext';

/**
 * Page for managing sampling information (sampling techniques and sites).
 *
 * @return {*}
 */
export const SamplingSiteManagePage = () => {
  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();

  return (
    <Stack>
      <SamplingSiteManageHeader
        project_id={surveyContext.projectId}
        project_name={projectContext.projectDataLoader.data?.projectData.project.project_name ?? ''}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name ?? ''}
      />

      <Container maxWidth={'xl'} sx={{ py: { xs: 2, sm: 3 } }}>
        <Paper sx={{ mb: 3 }}>
          <SamplingTechniqueContainer />
        </Paper>
        <Paper>
          <SamplingSiteManageSiteList />
        </Paper>
      </Container>
    </Stack>
  );
};
