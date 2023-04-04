import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { CodesContext } from 'contexts/codesContext';
import { ProjectContext } from 'contexts/projectContext';
import ProjectAttachments from 'features/projects/view/ProjectAttachments';
import SurveysListPage from 'features/surveys/list/SurveysListPage';
import React, { useContext, useEffect } from 'react';
import LocationBoundary from './components/LocationBoundary';
import ProjectDetails from './ProjectDetails';
import ProjectHeader from './ProjectHeader';

/**
 * Page to display a single Project.
 *
 * @return {*}
 */
const ProjectPage = () => {
  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  useEffect(() => codesContext.codesDataLoader.load(), [codesContext.codesDataLoader]);

  useEffect(() => projectContext.projectDataLoader.load(projectContext.projectId), [
    projectContext.projectDataLoader,
    projectContext.projectId
  ]);

  if (!codesContext.codesDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <ProjectHeader />

      <Container maxWidth="xl">
        <Box py={3}>
          <Grid container spacing={3}>
            <Grid item md={12} lg={4}>
              <Paper elevation={0}>
                <ProjectDetails />
              </Paper>
            </Grid>
            <Grid item md={12} lg={8}>
              <Box mb={3}>
                <Paper elevation={0}>
                  <SurveysListPage />
                </Paper>
              </Box>
              <Box mb={3}>
                <Paper elevation={0}>
                  <ProjectAttachments />
                </Paper>
              </Box>
              <Box>
                <Paper elevation={0}>
                  <LocationBoundary />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default ProjectPage;
