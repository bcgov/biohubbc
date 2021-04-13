import { Box, Divider, makeStyles, Paper, Typography } from '@material-ui/core';
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

const useStyles = makeStyles((theme) => ({
  projectDetailsSection: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(5),

    '&:last-child': {
      marginBottom: 0
    },

    '&:first-child': {
      marginTop: 0
    }
  },

  sectionDivider: {
    height: '3px'
  }
}));

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetails: React.FC<IProjectDetailsProps> = (props) => {
  const { projectForViewData, codes } = props;
  const classes = useStyles();

  return (
    <>
      <Box mb={6}>
        <Typography variant="h2">Project Details</Typography>
      </Box>

      <Box component={Paper} p={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <ProjectObjectives projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider className={classes.sectionDivider} />
        <Box component="section" className={classes.projectDetailsSection}>
          <GeneralInformation projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider className={classes.sectionDivider} />
        <Box component="section" className={classes.projectDetailsSection}>
          <ProjectCoordinator projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider className={classes.sectionDivider} />
        <Box component="section" className={classes.projectDetailsSection}>
          <LocationBoundary projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider className={classes.sectionDivider} />
        <Box component="section" className={classes.projectDetailsSection}>
          <Species projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider className={classes.sectionDivider} />
        <Box component="section" className={classes.projectDetailsSection}>
          <IUCNClassification projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider className={classes.sectionDivider} />
        <Box component="section" className={classes.projectDetailsSection}>
          <Partnerships projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
        <Divider className={classes.sectionDivider} />
        <Box component="section" className={classes.projectDetailsSection}>
          <FundingSource projectForViewData={projectForViewData} codes={codes} refresh={props.refresh} />
        </Box>
      </Box>
    </>
  );
};

export default ProjectDetails;
