import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Box from '@mui/system/Box';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useAnimalPageContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import SurveyAnimalList from './list/SurveyAnimalList';
import { AnimalProfile } from './profile/AnimalProfile';
import { SurveyAnimalHeader } from './SurveyAnimalHeader';

/**
 * Returns the page for managing Animals
 *
 * @returns
 */
const SurveyAnimalPage = () => {
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();

  const { selectedAnimal } = useAnimalPageContext();

  const crittersDataLoader = useDataLoader(() =>
    biohubApi.survey.getSurveyCritters(surveyContext.projectId, surveyContext.surveyId)
  );

  if (!crittersDataLoader.data) {
    crittersDataLoader.load();
  }

  if (!projectContext.projectDataLoader.data) {
    projectContext.projectDataLoader.load(surveyContext.projectId);
  }

  if (!projectContext.projectDataLoader.data || !surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Stack
      position="relative"
      height="100%"
      flex="1 1 auto"
      overflow="hidden"
      p={0}
      m={0}
      sx={{
        '& .MuiContainer-root': {
          maxWidth: 'none'
        }
      }}>
      <SurveyAnimalHeader
        project_id={surveyContext.projectId}
        project_name={projectContext.projectDataLoader.data.projectData.project.project_name}
        survey_id={surveyContext.surveyId}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
      />
      <Stack
        direction="row"
        gap={1.5}
        sx={{
          flex: '1 1 auto',
          p: 1,
          mr: 1
        }}>
        <Box minWidth="400px" maxWidth="30%">
          <SurveyAnimalList />
        </Box>

        {selectedAnimal && (
          <Box maxWidth="75%" flex="1 1 auto" height="100%">
            <AnimalProfile />
          </Box>
        )}
      </Stack>
    </Stack>
  );
};

export default SurveyAnimalPage;
