import { Box, Divider, Paper, Typography } from '@material-ui/core';
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
      <Box mb={6}>
        <Typography variant="h2">Project Details</Typography>
      </Box>

      <Box component={Paper} p={4}>
        <Box component="section" mb={5}>
          <ProjectObjectives projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider />
        <Box component="section" mt={4} mb={5}>
          <GeneralInformation projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider />
        <Box component="section" mt={4} mb={5}>
          <ProjectCoordinator projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider />
        <Box component="section" mt={4} mb={5}>
          <LocationBoundary projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider />
        <Box component="section" mt={4} mb={5}>
          <Species projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider />
        <Box component="section" mt={4} mb={5}>
          <IUCNClassification projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider />
        <Box component="section" mt={4} mb={5}>
          <Partnerships projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider />
        <Box component="section" mt={4}>
          <FundingSource projectForViewData={projectForViewData} />
        </Box>
      </Box>
    </>
  );
};

export default ProjectDetails;
