import Box from '@material-ui/core/Box';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import SurveysList from 'components/surveys/SurveysList';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveysListResponse } from 'interfaces/useSurveyApi.interface';
import React, { useEffect, useState } from 'react';
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
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const { projectForViewData } = props;

  const [surveys, setSurveys] = useState<IGetSurveysListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSurveys = async () => {
      const surveysResponse = await biohubApi.survey.getSurveysList(projectForViewData.id);

      setSurveys(() => {
        setIsLoading(false);
        return surveysResponse;
      });
    };

    if (isLoading) {
      getSurveys();
    }
  }, [biohubApi, isLoading, projectForViewData.id]);

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
        buttonOnClick={() => navigateToCreateSurveyPage(projectForViewData.id)}
      />
      <Box mb={3}>
        <SurveysList projectId={projectForViewData.id} surveysList={surveys} />
      </Box>
    </>
  );
};

export default SurveysListPage;
