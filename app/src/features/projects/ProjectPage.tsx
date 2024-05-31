import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import PageHeader from 'components/layout/PageHeader';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { useEffect } from 'react';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import ObservationTelemetryAnimalContainer, {
  ObservationTelemetryAnimalViewEnum
} from './ObservationTelemetryAnimalContainer';
import ProjectSurveyContainer, { ProjectSurveyViewEnum } from './ProjectSurveyContainer';

/**
 * Page to display a list of projects.
 *
 * @return {*}
 */
const ProjectsPage = () => {
  const params = new URLSearchParams();

  const location = useLocation();
  const history = useHistory();

  const projectSurveyViewParam = 'projectView';
  const observationAnimalsTelemetryViewParam = 'observationView';

  if (!params.get(projectSurveyViewParam)) {
    params.set(projectSurveyViewParam, ProjectSurveyViewEnum.PROJECTS);
  }
  if (!params.get(observationAnimalsTelemetryViewParam)) {
    params.set(observationAnimalsTelemetryViewParam, ObservationTelemetryAnimalViewEnum.OBSERVATIONS);
  }

  useEffect(() => {
    history.push({
      pathname: location.pathname,
      search: params.toString()
    });
  }, [location.search]);

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
          <ProjectSurveyContainer params={params} viewParam={projectSurveyViewParam} />
        </Paper>
        <Paper sx={{ mt: 3 }}>
          <ObservationTelemetryAnimalContainer params={params} viewParam={observationAnimalsTelemetryViewParam} />
        </Paper>
      </Container>
    </>
  );
};

export default ProjectsPage;
