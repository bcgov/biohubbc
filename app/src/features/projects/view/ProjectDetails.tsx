import Box from '@material-ui/core/Box';
import { grey } from '@material-ui/core/colors';
import Divider from '@material-ui/core/Divider';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import assert from 'assert';
import FundingSource, { IFundingSource } from 'components/funding-source/FundingSource';
import { ProjectContext } from 'contexts/projectContext';
import GeneralInformation from 'features/projects/view/components/GeneralInformation';
import IUCNClassification from 'features/projects/view/components/IUCNClassification';
import Partnerships from 'features/projects/view/components/Partnerships';
import ProjectCoordinator from 'features/projects/view/components/ProjectCoordinator';
import ProjectObjectives from 'features/projects/view/components/ProjectObjectives';
import { useContext } from 'react';

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
  const projectContext = useContext(ProjectContext);

  // Project data must be loaded by a parent before this component is rendered
  assert(projectContext.projectDataLoader.data);
  const funding_sources = projectContext.projectDataLoader.data.projectData.funding.fundingSources.map((item) => {
    return {
      id: item.id,
      agency_name: item.agency_name,
      investment_action_category_name: item.investment_action_category_name,
      funding_amount: item.funding_amount,
      start_date: item.start_date,
      end_date: item.end_date,
      agency_project_id: item.agency_project_id,
      first_nations_name: item.first_nations_name
    } as IFundingSource;
  });

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
          <FundingSource funding_sources={funding_sources} />
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
