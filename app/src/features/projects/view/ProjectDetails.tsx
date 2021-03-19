import { Box, Paper, Typography } from '@material-ui/core';
import FundingSource from 'features/projects/view/components/FundingSource';
import GeneralInformation from 'features/projects/view/components/GeneralInformation';
import IUCNClassification from 'features/projects/view/components/IUCNClassification';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import ProjectCoordinator from 'features/projects/view/components/ProjectCoordinator';
import ProjectObjectives from 'features/projects/view/components/ProjectObjectives';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import Species from './components/Species';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetails: React.FC<IProjectDetailsProps> = (props) => {
  const { projectForViewData, codes } = props;

  return (
    <>
      <Box mb={4}>
        <Typography variant="h2">Project Details</Typography>
      </Box>
      <Box mb={3}>
        <Paper>
          <ProjectObjectives projectForViewData={projectForViewData}></ProjectObjectives>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <GeneralInformation projectForViewData={projectForViewData} codes={codes}></GeneralInformation>
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <LocationBoundary projectForViewData={projectForViewData}></LocationBoundary>
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <Species projectForViewData={projectForViewData}></Species>
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <ProjectCoordinator projectForViewData={projectForViewData}></ProjectCoordinator>
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <IUCNClassification projectForViewData={projectForViewData}></IUCNClassification>
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <FundingSource projectForViewData={projectForViewData}></FundingSource>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default ProjectDetails;
