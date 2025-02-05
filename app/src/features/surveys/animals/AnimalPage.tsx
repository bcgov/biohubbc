import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Box from '@mui/system/Box';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useAnimalPageContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import { SurveySpatialAnimal } from '../view/survey-spatial/components/animal/SurveySpatialAnimal';
import { AnimalHeader } from './AnimalHeader';
import { AnimalListContainer } from './list/AnimalListContainer';
import { AnimalProfileContainer } from './profile/AnimalProfileContainer';

/**
 * Returns the page for managing Animals
 *
 * @return {*}
 */
export const SurveyAnimalPage = () => {
  const biohubApi = useBiohubApi();

  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();
  const animalPageContext = useAnimalPageContext();

  const crittersDataLoader = useDataLoader(() =>
    biohubApi.survey.getSurveyCritters(surveyContext.projectId, surveyContext.surveyId)
  );

  useEffect(() => {
    crittersDataLoader.load();
  }, [crittersDataLoader]);

  useEffect(() => {
    projectContext.projectDataLoader.load(surveyContext.projectId);
  }, [projectContext.projectDataLoader, surveyContext.projectId]);

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
      <AnimalHeader
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
          <AnimalListContainer />
        </Box>

        <Box maxWidth="75%" flex="1 1 auto" height="100%">
          {animalPageContext.selectedAnimal ? (
            <AnimalProfileContainer />
          ) : (
            <Paper elevation={3} sx={{ height: '100%', p: 2 }}>
              <SurveySpatialAnimal />
            </Paper>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};
