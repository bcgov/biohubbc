import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { CodesContext } from 'contexts/codesContext';
import { ProjectContext } from 'contexts/projectContext';
import ProjectAttachments from 'features/projects/view/ProjectAttachments';
import SurveysListPage from 'features/surveys/list/SurveysListPage';
import { useContext, useEffect } from 'react';
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

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    projectContext.projectDataLoader.load(projectContext.projectId);
  }, [projectContext.projectDataLoader, projectContext.projectId]);

  if (!codesContext.codesDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <ProjectHeader />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Paper>
              <ProjectDetails />
            </Paper>
          </Grid>
          <Grid item xs={12} lg={8}>
            <Box mb={3}>
              <Paper>
                <SurveysListPage />
              </Paper>
            </Box>
            <Box mb={3}>
              <Paper>
                <ProjectAttachments />
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default ProjectPage;
