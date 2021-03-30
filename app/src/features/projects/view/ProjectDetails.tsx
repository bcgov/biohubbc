import { Box, Paper, Typography } from '@material-ui/core';
import FundingSource from 'features/projects/view/components/FundingSource';
import GeneralInformation from 'features/projects/view/components/GeneralInformation';
import IUCNClassification from 'features/projects/view/components/IUCNClassification';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import Partnerships from 'features/projects/view/components/Partnerships';
import ProjectCoordinator from 'features/projects/view/components/ProjectCoordinator';
import ProjectObjectives from 'features/projects/view/components/ProjectObjectives';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import Species from './components/Species';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
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
          <ProjectObjectives projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <GeneralInformation projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <ProjectCoordinator projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <LocationBoundary projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <Species projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <IUCNClassification projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <FundingSource projectForViewData={projectForViewData} />
          </Box>
        </Paper>
      </Box>

      <Box mb={4}>
        <Paper>
          <Box m={3}>
            <Partnerships projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default ProjectDetails;
