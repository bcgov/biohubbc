import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import SurveysList from 'components/surveys/SurveysList';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { useHistory } from 'react-router';

export interface ISurveysListPageProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Project surveys content for a project.
 *
 * @return {*}
 */
const SurveysListPage: React.FC<ISurveysListPageProps> = (props) => {
  const { projectForViewData } = props;

  const history = useHistory();
  const biohubApi = useBiohubApi();

  const surveyDataLoader = useDataLoader(() => biohubApi.survey.getSurveysList(projectForViewData.id));
  surveyDataLoader.load();

  const navigateToCreateSurveyPage = (projectId: number) => {
    history.push(`/admin/projects/${projectId}/survey/create`);
  };

  if (!surveyDataLoader.data) {
    return <></>;
  }

  return (
    <>
      <Paper>
        <H2ButtonToolbar
          label="Surveys"
          buttonLabel="Create Survey"
          buttonTitle="Create Survey"
          buttonStartIcon={<Icon path={mdiPlus} size={1} />}
          buttonOnClick={() => navigateToCreateSurveyPage(projectForViewData.id)}
        />
        <Box px={3} pb={2}>
          <SurveysList projectId={projectForViewData.id} surveysList={surveyDataLoader.data} />
        </Box>
      </Paper>
    </>
  );
};

export default SurveysListPage;
