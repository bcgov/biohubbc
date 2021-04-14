import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectSurveysProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Project surveys content for a project.
 *
 * @return {*}
 */
const ProjectSurveys: React.FC<IProjectSurveysProps> = () => {
  return (
    <>
      <Box mb={5}>
        <Typography variant="h2">Project Surveys</Typography>
      </Box>
      <Box mb={3}>
        <Paper>
          <Box p={3}>Project survey component 1 placeholder</Box>
        </Paper>
      </Box>
      <Box mb={3}>
        <Paper>
          <Box p={3}>Project survey component 2 placeholder</Box>
        </Paper>
      </Box>
    </>
  );
};

export default ProjectSurveys;
