import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Box from '@mui/system/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiCog, mdiCrosshairsGps } from '@mdi/js';
import { useState } from 'react';
import RouteWithTitle from 'utils/RouteWithTitle';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useAnimalPageContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import { AnimalHeader } from './AnimalHeader';
import { AnimalListContainer } from './list/AnimalListContainer';
import { AnimalProfileContainer } from './profile/AnimalProfileContainer';
import { SurveySpatialAnimal } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimal';

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
      <Stack direction="row" gap={1.5} sx={{ flex: '1 1 auto', p: 1, mr: 1 }}>
        <Box minWidth="400px" maxWidth="30%">
          <AnimalListContainer />
        </Box>
        <Box maxWidth="75%" flex="1 1 auto" height="100%">
          {animalPageContext.selectedAnimal ? (
            <AnimalProfileContainer />
          ) : (
            <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center'}}>
                <Button
                  variant="contained"
                  color="primary"
                  aria-label="Manage Captures"
                  onClick={handleMenuClick}
                  startIcon={<Icon path={mdiCog} size={0.75} />} 
                  endIcon={<Icon path={mdiChevronDown} size={0.75} />}>
                  Manage
                </Button>
              </Toolbar>
              <Divider flexItem />
              <Box p={2} flex="1 1 auto">
                <SurveySpatialAnimal />
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MenuItem>
                  <RouteWithTitle
                    exact
                    path={'/admin/projects/:id/surveys/:survey_id/animals/captures'}
                    title={'Create Captures'}
                  />
                  <ListItemIcon>
                    <Icon path={mdiCrosshairsGps} size={0.8} />
                  </ListItemIcon>
                  <ListItemText>Captures</ListItemText>
                </MenuItem>
              </Menu>
            </Paper>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};
