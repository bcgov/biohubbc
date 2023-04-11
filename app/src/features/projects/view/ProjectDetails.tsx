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
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
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
  }
}));

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetails = () => {
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
          <ProjectObjectives />
        </Box>

        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            General Information
          </Typography>
          <Divider></Divider>
          <GeneralInformation />
        </Box>

        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            Project Coordinator
          </Typography>
          <Divider></Divider>
          <ProjectCoordinator />
        </Box>

        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            Funding Sources
          </Typography>
          <Divider></Divider>
          <FundingSource />
        </Box>

        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            Partnerships
          </Typography>
          <Divider></Divider>
          <Partnerships />
        </Box>

        <Box component="section" mb={0}>
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            IUCN Classification
          </Typography>
          <Divider></Divider>
          <IUCNClassification />
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectDetails;
