import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import assert from 'assert';
import SurveysList from 'components/surveys/SurveysList';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { CodesContext } from 'contexts/codesContext';
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

  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  assert(codesContext.codesDataLoader.data);
  assert(projectContext.surveysListDataLoader.data);

  const codes = codesContext.codesDataLoader.data;
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
        buttonStartIcon={<Icon path={mdiPlus} size={0.8} />}
        buttonProps={{ variant: 'contained' }}
        buttonOnClick={() => navigateToCreateSurveyPage(projectContext.projectId)}
      />
      <Divider></Divider>
      <Box px={1}>
        <SurveysList projectId={projectContext.projectId} surveysList={surveys || []} codes={codes} />
      </Box>
    </>
  );
};

export default SurveysListPage;
