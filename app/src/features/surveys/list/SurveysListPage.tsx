import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import assert from 'assert';
import { ProjectRoleGuard } from 'components/security/Guards';
import SurveysList from 'components/surveys/SurveysList';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { ProjectContext } from 'contexts/projectContext';
import React, { useContext } from 'react';
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

  const surveys = projectContext.surveysListDataLoader.data;

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
            validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button {...buttonProps} />
          </ProjectRoleGuard>
        )}
      />
      <Divider></Divider>
      <Box px={1}>
        <SurveysList projectId={projectContext.projectId} surveysList={surveys || []} />
      </Box>
    </>
  );
};

export default SurveysListPage;
