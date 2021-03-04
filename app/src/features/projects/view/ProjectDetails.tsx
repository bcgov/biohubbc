import { Box, Paper, Typography } from '@material-ui/core';
import React from 'react';

export interface IProjectDetailsProps {
  projectData: any;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetails: React.FC<IProjectDetailsProps> = () => {
  return (
    <>
      <Box mb={5}>
        <Typography variant="h2">Project Details</Typography>
      </Box>
      <Box mb={3}>
        <Paper>
          <Box p={3}>Project details component 1 placeholder</Box>
        </Paper>
      </Box>
      <Box mb={3}>
        <Paper>
          <Box p={3}>Project details component 2 placeholder</Box>
        </Paper>
      </Box>
    </>
  );
};

export default ProjectDetails;
