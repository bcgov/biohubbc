import { Box, Paper, Typography } from '@material-ui/core';
import React from 'react';

export interface IProjectSurveysProps {
  projectData: any;
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
