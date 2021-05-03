import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { IGetProjectForViewResponse, IGetProjectSurvey } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { useHistory } from 'react-router';
import SurveysList from 'components/surveys/SurveysList';

export interface IProjectSurveysListPageProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Project surveys content for a project.
 *
 * @return {*}
 */
const ProjectSurveysListPage: React.FC<IProjectSurveysListPageProps> = (props) => {
  const history = useHistory();
  const { projectForViewData } = props;

  const navigateToCreateSurveyPage = (projectId: number) => {
    history.push(`/projects/${projectId}/survey/create`);
  };

  // TODO: Replace this with the result of an API call giving us back the surveyList data
  const surveysList: IGetProjectSurvey[] = [
    {
      id: 1,
      name: 'Moose Survey 1',
      species: 'Moose',
      start_date: '2021-04-09 11:53:53',
      end_date: '2021-05-09 11:53:53',
      status_name: 'Unpublished'
    }
  ];

  return (
    <>
      <Box my={4}>
        <Container maxWidth="xl">
          <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h1">Surveys</Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigateToCreateSurveyPage(projectForViewData.id)}>
              Create Survey
            </Button>
          </Box>
          <Box mb={3}>
            <SurveysList surveysList={surveysList} />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ProjectSurveysListPage;
