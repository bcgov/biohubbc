import { Box, Paper, Typography } from '@material-ui/core';
import React from 'react';
import ProjectObjectives from 'features/projects/view/components/ProjectObjectives';
import GeneralInformation from 'features/projects/view/components/GeneralInformation';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import { IProjectWithDetails } from 'interfaces/project-interfaces';

export interface IProjectDetailsProps {
  projectWithDetailsData: IProjectWithDetails;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetails: React.FC<IProjectDetailsProps> = (props) => {
  const { projectWithDetailsData } = props;

  return (
    <>
      <Box mb={4}>
        <Typography variant="h2">Project Details</Typography>
      </Box>
      <Box mb={3}>
        <Paper>
          <ProjectObjectives projectWithDetailsData={projectWithDetailsData}></ProjectObjectives>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <GeneralInformation projectWithDetailsData={projectWithDetailsData}></GeneralInformation>
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <LocationBoundary projectWithDetailsData={projectWithDetailsData}></LocationBoundary>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default ProjectDetails;
