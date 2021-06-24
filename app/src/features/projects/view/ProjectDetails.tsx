import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
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
import ProjectPermits from './components/ProjectPermits';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  projectDetailsSection: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(5),
    '&:last-child': {
      marginBottom: 0
    },
    '&:first-child': {
      marginTop: 0
    }
  }
}));

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetails: React.FC<IProjectDetailsProps> = (props) => {
  const { projectForViewData, codes, refresh } = props;

  const classes = useStyles();

  return (
    <>
      <Box mb={5}>
        <Typography variant="h2">Project Details</Typography>
      </Box>

      <Box component={Paper} p={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <GeneralInformation projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <ProjectObjectives projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <GeneralInformation projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <ProjectCoordinator projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <ProjectPermits projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <LocationBoundary projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <IUCNClassification projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <Partnerships projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.projectDetailsSection}>
          <FundingSource projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>
    </>
  );
};

export default ProjectDetails;
