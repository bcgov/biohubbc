import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
// import Paper from '@material-ui/core/Paper';
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
import { grey } from '@material-ui/core/colors';

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
      marginTop: theme.spacing(2.5)
    },
    '& dl div': {
      borderTopStyle: 'solid',
      borderTopWidth: '1px',
      borderColor: grey[300],
      paddingTop: '6px',
      paddingBottom: '6px'
    },
    '& dt': {
      flex: '0 0 40%'
    },
    '& dd': {
      flex: '1 1 auto'
    }
  },
  projectMetaSectionHeader: {
    marginBottom: '2px',
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'uppercase'
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
      <Box py={2.75} px={3} className={classes.projectMetadata}>
        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            Project Objectives
          </Typography>
          <Divider style={{marginTop: '10px'}}></Divider>
          <Box py={1}>
            <ProjectObjectives projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
          </Box>
        </Box>

        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            General Information
          </Typography>
          <Box mt="10px">
            <GeneralInformation projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
          </Box>
        </Box>

        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            Project Coordinator
          </Typography>
          <Divider style={{marginTop: '10px'}}></Divider>
          <Box py="6px">
            <ProjectCoordinator projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
          </Box>
        </Box>

        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            Funding Sources
          </Typography>
          <Divider style={{marginTop: '10px'}}></Divider>
          <FundingSource projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>

        <Box component="section">
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            Partnerships
          </Typography>
          <Box mt="10px">
            <Partnerships projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
          </Box>
        </Box>

        <Box component="section" mb={0}>
          <Typography component="h4" className={classes.projectMetaSectionHeader}>
            IUCN Classification
          </Typography>
          <Divider style={{marginTop: '10px'}}></Divider>
          <IUCNClassification projectForViewData={projectForViewData} codes={codes} refresh={refresh} />
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectDetails;
