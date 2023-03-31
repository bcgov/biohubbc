import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import SurveysList from 'components/surveys/SurveysList';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { ProjectViewObject } from 'interfaces/useProjectApi.interface';
import { SurveyViewObject } from 'interfaces/useSurveyApi.interface';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

export interface ISurveysListPageProps {
  projectForViewData: ProjectViewObject;
  codes: IGetAllCodeSetsResponse;
}

/**
 * Project surveys content for a project.
 *
 * @return {*}
 */
const SurveysListPage: React.FC<ISurveysListPageProps> = (props) => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const { projectForViewData, codes } = props;

  const [surveys, setSurveys] = useState<SurveyViewObject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSurveys = async () => {
      const surveysResponse = await biohubApi.survey.getSurveysList(projectForViewData.project.id);

      setSurveys(() => {
        setIsLoading(false);
        return surveysResponse;
      });
    };

    if (isLoading) {
      getSurveys();
    }
  }, [biohubApi, isLoading, projectForViewData.project.id]);

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
        buttonOnClick={() => navigateToCreateSurveyPage(projectForViewData.project.id)}
      />
      <Divider></Divider>
      <Box px={1}>
        <SurveysList projectId={projectForViewData.project.id} surveysList={surveys} codes={codes} />
      </Box>
    </>
  );
};

export default SurveysListPage;
