import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import assert from 'assert';
import { ProjectRoleGuard } from 'components/security/Guards';
import SurveysList from 'components/surveys/SurveysList';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { ProjectContext } from 'contexts/projectContext';
import { useContext } from 'react';
import { useHistory } from 'react-router';

/**
 * List of Surveys belonging to a Project.
 *
 * @return {*}
 */
const SurveysListPage = () => {
  const history = useHistory();

  const projectContext = useContext(ProjectContext);

  assert(projectContext.surveysListDataLoader.data);

  const navigateToCreateSurveyPage = (projectId: number) => {
    history.push(`/admin/projects/${projectId}/survey/create`);
  };

  return (
    <>
      <H2ButtonToolbar
        label="Surveys"
        buttonLabel="Create Survey"
        buttonTitle="Create Survey"
        buttonStartIcon={<Icon path={mdiPlus} size={1} />}
        buttonProps={{ variant: 'contained', disableElevation: true }}
        buttonOnClick={() => navigateToCreateSurveyPage(projectContext.projectId)}
        renderButton={(buttonProps) => (
          <ProjectRoleGuard
            validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button {...buttonProps} />
          </ProjectRoleGuard>
        )}
      />
      <Divider></Divider>
      <Box p={3}>
        <Paper variant="outlined">
          <SurveysList />
        </Paper>
      </Box>
    </>
  );
};

export default SurveysListPage;
