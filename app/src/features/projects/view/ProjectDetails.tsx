import Box from '@material-ui/core/Box';
import { grey } from '@material-ui/core/colors';
import Divider from '@material-ui/core/Divider';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import FundingSource from 'features/projects/view/components/FundingSource';
import GeneralInformation from 'features/projects/view/components/GeneralInformation';
import IUCNClassification from 'features/projects/view/components/IUCNClassification';
import Partnerships from 'features/projects/view/components/Partnerships';
import ProjectCoordinator from 'features/projects/view/components/ProjectCoordinator';
import ProjectObjectives from 'features/projects/view/components/ProjectObjectives';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

const useStyles = makeStyles((theme: Theme) => ({
  projectTitle: {
    fontWeight: 400
  },
  projectMetadata: {
    '& section + section': {
      marginTop: theme.spacing(4)
    },
    '& dt': {
      flex: '0 0 40%'
    },
    '& dd': {
      flex: '1 1 auto'
    },
    '& .MuiListItem-root': {
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5)
    },
    '& .MuiListItem-root:first-of-type': {
      paddingTop: 0
    },
    '& .MuiListItem-root:last-of-type': {
      paddingBottom: 0
    }
  },
  projectMetaSectionHeader: {
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '0.02rem',
    textTransform: 'uppercase',
    color: grey[600],
    '& + hr': {
      marginTop: theme.spacing(1.5),
      marginBottom: theme.spacing(1.5)
    }
  },
  projectMetaObjectives: {
    display: '-webkit-box',
    '-webkit-line-clamp': 4,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden'
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
    <Box>
      <Toolbar>
        <Typography variant="h4" component="h3">
          Project Details
        </Typography>
      </Toolbar>
      <Divider></Divider>
      <Box p={3} className={classes.projectMetadata}>
        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            Project Objectives
          </Typography>
          <Divider></Divider>
          <ProjectObjectives projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>

        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            General Information
          </Typography>
          <Divider></Divider>
          <GeneralInformation projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>

        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            Project Coordinator
          </Typography>
          <Divider></Divider>
          <ProjectCoordinator projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>

        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            Funding Sources
          </Typography>
          <Divider></Divider>
          <FundingSource projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>

        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            Partnerships
          </Typography>
          <Divider></Divider>
          <Box>
            <Partnerships projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
          </Box>
        </Box>

        <Box component="section" mb={0}>
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            IUCN Classification
          </Typography>
          <Divider></Divider>
          <IUCNClassification projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectDetails;
