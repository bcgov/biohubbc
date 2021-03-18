import { Box, Paper, Typography } from '@material-ui/core';
import React from 'react';
import ProjectObjectives from 'features/projects/view/components/ProjectObjectives';
import ProjectCoordinator from 'features/projects/view/components/ProjectCoordinator';
import GeneralInformation from 'features/projects/view/components/GeneralInformation';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import IUCNClassification from 'features/projects/view/components/IUCNClassification';
import FundingSource from 'features/projects/view/components/FundingSource';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import { IGetAllCodesResponse } from 'interfaces/useBioHubApi-interfaces';

export interface IProjectDetailsProps {
  projectWithDetailsData: IProjectWithDetails;
  codes: IGetAllCodesResponse;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetails: React.FC<IProjectDetailsProps> = (props) => {
  const { projectWithDetailsData, codes } = props;

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
            <GeneralInformation projectWithDetailsData={projectWithDetailsData} codes={codes}></GeneralInformation>
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

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <ProjectCoordinator projectWithDetailsData={projectWithDetailsData}></ProjectCoordinator>
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <IUCNClassification projectWithDetailsData={projectWithDetailsData}></IUCNClassification>
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <FundingSource projectWithDetailsData={projectWithDetailsData}></FundingSource>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default ProjectDetails;
