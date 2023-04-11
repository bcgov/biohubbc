import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { ProjectRoleGuard } from 'components/security/Guards';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import assert from 'assert';
import SurveysList from 'components/surveys/SurveysList';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { CodesContext } from 'contexts/codesContext';
import { ProjectContext } from 'contexts/projectContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router';

/**
 * List of Surveys belonging to a Project.
 *
 * @return {*}
 */
const SurveysListPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  assert(codesContext.codesDataLoader.data);

  const codes = codesContext.codesDataLoader.data;

  const surveysListDataLoader = useDataLoader((projectId: number) => biohubApi.survey.getSurveysList(projectId));

  useEffect(() => {
    surveysListDataLoader.load(projectContext.projectId);
  }, [surveysListDataLoader, projectContext.projectId]);

  const navigateToCreateSurveyPage = (projectId: number) => {
    history.push(`/admin/projects/${projectId}/survey/create`);
  };

  return (
    <>
      <H2ButtonToolbar
        label="Surveys"
        buttonLabel="Create Survey"
        buttonTitle="Create Survey"
        buttonStartIcon={<Icon path={mdiPlus} size={0.8} />}
        buttonProps={{ variant: 'contained' }}
        buttonOnClick={() => navigateToCreateSurveyPage(projectContext.projectId)}
        renderButton={(buttonProps) => (
          <ProjectRoleGuard
            validProjectRoles={[PROJECT_ROLE.PROJECT_VIEWER, PROJECT_ROLE.PROJECT_EDITOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN + '0' as SYSTEM_ROLE]}
          >
            <Button {...buttonProps} />
          </ProjectRoleGuard>
        )}
      />
      <Divider></Divider>
      <Box px={1}>
        <SurveysList
          projectId={projectContext.projectId}
          surveysList={surveysListDataLoader.data || []}
          codes={codes}
        />
      </Box>
    </>
  );
};

export default SurveysListPage;
