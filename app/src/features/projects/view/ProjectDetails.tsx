import { Box, Paper, Typography } from '@material-ui/core';
import React from 'react';
import ProjectObjectives from 'features/projects/view/components/ProjectObjectives';
import GeneralInformation from 'features/projects/view/components/GeneralInformation';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';

export interface IProjectDetailsProps {
  projectData: any;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetails: React.FC<IProjectDetailsProps> = (props) => {
  const { projectData } = props;

  return (
    <>
      <Box mb={4}>
        <Typography variant="h2">Project Details</Typography>
      </Box>
      <Box mb={3}>
        <Paper>
          <ProjectObjectives projectData={projectData}></ProjectObjectives>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <GeneralInformation projectData={projectData}></GeneralInformation>
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <LocationBoundary projectData={projectData}></LocationBoundary>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default ProjectDetails;
