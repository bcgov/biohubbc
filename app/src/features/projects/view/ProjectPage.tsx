import { mdiMapSearchOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Skeleton, Toolbar, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { CodesContext } from 'contexts/codesContext';
import { ProjectContext } from 'contexts/projectContext';
import ProjectAttachments from 'features/projects/view/ProjectAttachments';
import SurveysListPage from 'features/surveys/list/SurveysListPage';
import { useContext, useEffect } from 'react';
import StudyAreasMap from './components/StudyAreasMap';
import ProjectDetails from './ProjectDetails';
import ProjectHeader from './ProjectHeader';

//TODO: PRODUCTION_BANDAGE: Remove <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>

/**
 * Page to display a single Project.
 *
 * @return {*}
 */
const ProjectPage = () => {
  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  const numSurveys = projectContext.surveysListDataLoader.data?.length || 0;

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    projectContext.projectDataLoader.load(projectContext.projectId);
  }, [projectContext.projectDataLoader, projectContext.projectId]);

  if (
    !codesContext.codesDataLoader.data ||
    !projectContext.projectDataLoader.data ||
    !projectContext.surveysListDataLoader.data
  ) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <ProjectHeader />
      <Container maxWidth="xl">
        <Box py={3}>
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
            {/* <ProjectSubmissionAlertBar /> */}
          </SystemRoleGuard>
          <Grid container spacing={3}>
            <Grid item md={12} lg={4}>
              <Paper elevation={0}>
                <ProjectDetails />
              </Paper>
            </Grid>
            <Grid item md={12} lg={8}>
              <Box mb={3}>
                <Paper elevation={0} sx={{ overflow: 'hidden' }}>
                  <Toolbar>
                    <Typography
                      component="h3"
                      variant="h4"
                      sx={{
                        flex: '1 1 auto'
                      }}>
                      Surveys &zwnj;
                      {!projectContext ? (
                        ' '
                      ) : (
                        <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
                          ({numSurveys})
                        </Typography>
                      )}
                    </Typography>
                  </Toolbar>
                  {/* <Paper elevation={0} sx={{ overflow: 'hidden' }}> */}
                  <Box position="relative" height={{ sm: 400, md: 500 }}>
                    {projectContext.surveysListDataLoader.isLoading && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          zIndex: 1002,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#fff',
                          '& svg': {
                            color: grey[300]
                          }
                        }}>
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height="100%"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0
                          }}
                        />
                        <Icon path={mdiMapSearchOutline} size={2} />
                      </Box>
                    )}
                    <StudyAreasMap />
                  </Box>
                  {/* </Paper> */}
                </Paper>
              </Box>
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
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default ProjectPage;
