import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveysListResponse } from 'interfaces/useSurveyApi.interface';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import SurveysList from 'components/surveys/SurveysList';
import { useBiohubApi } from 'hooks/useBioHubApi';

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
    history.push(`/projects/${projectId}/survey/create`);
  };

  return (
    <Box mb={6}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h2">Surveys</Typography>
          <Button variant="outlined" color="primary" onClick={() => navigateToCreateSurveyPage(projectForViewData.id)}>
            Create Survey
          </Button>
        </Box>
        <Box mb={3}>
          <SurveysList projectId={projectForViewData.id} surveysList={surveys} />
        </Box>
      </Container>
    </Box>
  );
};

export default SurveysListPage;
