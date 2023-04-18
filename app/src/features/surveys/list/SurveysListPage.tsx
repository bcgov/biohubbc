import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
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
        buttonStartIcon={<Icon path={mdiPlus} size={1} />}
        buttonProps={{ variant: 'contained', disableElevation: true }}
        buttonOnClick={() => navigateToCreateSurveyPage(projectContext.projectId)}
      />
      <Divider></Divider>
      <Box p={3}>
        <Paper variant="outlined">
          <SurveysList
            projectId={projectContext.projectId}
            surveysList={surveysListDataLoader.data || []}
            codes={codes}
          />
        </Paper>
      </Box>
    </>
  );
};

export default SurveysListPage;
