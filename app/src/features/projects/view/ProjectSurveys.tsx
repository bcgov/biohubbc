import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import SurveysList from 'components/surveys/SurveysList';
import { IGetProjectSurvey } from 'interfaces/useProjectApi.interface';
import React from 'react';

/**
 * Project surveys content for a project.
 *
 * @return {*}
 */
const ProjectSurveys = () => {
  // TODO: Replace this with the result of an API call giving us back the surveyList data
  const surveysList: IGetProjectSurvey[] = [
    {
      id: 1,
      name: 'Moose Survey 1',
      species: 'Moose',
      start_date: '2020/04/04',
      end_date: '2021/05/05',
      status_name: 'Unpublished'
    }
  ];

  return (
    <>
      <Box mb={5}>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="h2">Surveys</Typography>
          </Box>
          <Button variant="outlined" color="primary" onClick={() => console.log('add survey clicked')}>
            Add Survey
          </Button>
        </Box>
      </Box>
      <Box mb={3}>
        <SurveysList surveysList={surveysList} />
      </Box>
    </>
  );
};

export default ProjectSurveys;
