import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
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
  projectOverview: {
    '& section + section': {
      marginTop: '20px'
    },
    '& dt': {
      flex: '0 0 100px',
      margin: '0',
      color: theme.palette.text.secondary
    },
    '& dd': {
      flex: '1 1 auto'
    }
  },
  projectMetaRow: {
    display: 'flex',
    paddingTop: theme.spacing(0.25),
    paddingBottom: theme.spacing(0.25)
  },
  projectMetaSectionHeader: {
    marginBottom: theme.spacing(1.5),
    color: theme.palette.text.primary,
    fontSize: '14px',
    fontWeight: 700,
    textTransform: 'uppercase'
  },
  projectMetaObjectives: {
    display: '-webkit-box',
    '-webkit-line-clamp': 4,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden'
  },
  readMoreButton: {
    marginTop: '6px',
    marginLeft: '-5px',
    marginBottom: '-5px',
    fontWeight: 700,
    fontSize: '14px',
    color: '#1a5a96'
  }
}));

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetails: React.FC<IProjectDetailsProps> = (props) => {
  const classes = useStyles();

  return (
    <Box component={Paper} p={3}>
      <Box className={classes.projectOverview}>
        <Toolbar>
          <Typography variant="h4" component="h3">
            Project Details
          </Typography>
        </Toolbar>
        <Divider></Divider>
        <Box p={3}>
          <Box component="section">
            <Typography component="h4" className={classes.projectMetaSectionHeader}>
              Project Objectives
            </Typography>
            <Typography color="textSecondary" className={classes.projectMetaObjectives}>
              Snow depths were recorded along with observations of animal tracks on the areas at irregular intervals
              throughout each winter. Fecal pellet group counts were carried out over a period of several years to
              determine relative moose use of the This paper reports on some aspects of the ecology of a winter range
              used by a migratory moose population.
            </Typography>
            <Button className={classes.readMoreButton} variant="text" color="primary" size="small">
              READ MORE...
            </Button>
          </Box>
          <Divider style={{ marginTop: '20px', marginBottom: '20px' }}></Divider>
          <Box component="section">
            <Typography component="h4" className={classes.projectMetaSectionHeader}>
              General Information
            </Typography>
            <Box component="dl">
              <Box className={classes.projectMetaRow}>
                <Typography component="dt">Type</Typography>
                <Typography component="dd">Wildlife</Typography>
              </Box>
              <Box className={classes.projectMetaRow}>
                <Typography component="dt">Location</Typography>
                <Typography component="dd">Skeena Natural Resource Region</Typography>
              </Box>
              <Box className={classes.projectMetaRow}>
                <Typography component="dt">Activities</Typography>
                <Typography component="dd">Inventory, Monitoring</Typography>
              </Box>
              <Box className={classes.projectMetaRow}>
                <Typography component="dt">Timeline</Typography>
                <Typography component="dd">YYYY-MM-DD to YYYY-MM-DD</Typography>
              </Box>
            </Box>
          </Box>
          <Divider style={{ marginTop: '20px', marginBottom: '20px' }}></Divider>
          <Box component="section">
            <Typography component="h4" className={classes.projectMetaSectionHeader}>
              Project Coordinator
            </Typography>
            <Box mt={1}>
              <Typography component="div">John Smith</Typography>
              <Typography component="div" color="textSecondary">
                Consulting Agency Name
              </Typography>
              <Typography component="div" color="textSecondary">
                email@email.com
              </Typography>
            </Box>
          </Box>
          <Divider style={{ marginTop: '20px', marginBottom: '20px' }}></Divider>
          <Box component="section">
            <Typography component="h4" className={classes.projectMetaSectionHeader}>
              Funding Sources
            </Typography>
            <Box mt={1}>
              <Typography component="div">Together for Wildlife - Action 1</Typography>
              <Typography component="div" color="textSecondary">
                $1,000,000
              </Typography>
              <Typography component="div" color="textSecondary">
                YYYY-MM-DD to YYYY-MM-DD
              </Typography>
            </Box>
          </Box>
          <Divider style={{ marginTop: '20px', marginBottom: '20px' }}></Divider>
          <Box component="section">
            <Typography component="h4" className={classes.projectMetaSectionHeader}>
              Partnerships
            </Typography>
            <Box mt={1}>
              <Typography component="div">Indigenous Partnerships</Typography>
              <Typography component="div" color="textSecondary">
                Ahousaht First Nation, Adams Lake Indian Band, Acho Dene Koe First Nation
              </Typography>
            </Box>
            <Box mt={1}>
              <Typography component="div">Other Partnerships</Typography>
              <Typography component="div" color="textSecondary">
                BC Hydro
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectDetails;
