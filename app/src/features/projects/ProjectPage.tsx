import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import PageHeader from 'components/layout/PageHeader';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { Link as RouterLink } from 'react-router-dom';
import ObservationTelemetryAnimalContainer from './ObservationTelemetryAnimalContainer';
import ProjectSurveyContainer from './ProjectSurveyContainer';

/**
 * Page to display a list of projects.
 *
 * @return {*}
 */
const ProjectsPage = () => {
  /**
   * Display projects, surveys and survey data
   */
  return (
    <>
      <PageHeader
        title="Projects"
        buttonJSX={
          <SystemRoleGuard
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiPlus} size={1} />}
              component={RouterLink}
              to={'/admin/projects/create'}>
              Create Project
            </Button>
          </SystemRoleGuard>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper>
          <ProjectSurveyContainer />
        </Paper>
        <Paper sx={{ mt: 3 }}>
          <ObservationTelemetryAnimalContainer />
        </Paper>
      </Container>
    </>
  );
};

export default ProjectsPage;
