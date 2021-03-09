import { Box, Grid, IconButton, Paper, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import React from 'react';
import { DATE_FORMAT } from 'constants/dateFormats';
import { getFormattedDateRangeString } from 'utils/Utils';

export interface IProjectDetailsProps {
  projectData: any;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectDetails: React.FC<IProjectDetailsProps> = (props) => {
  const projectData = props.projectData;

  // TODO this is using IProject in the mean time, but will eventually need something like IProjectRecord
  //const [project ] = useState<IProject | null>(null);

  return (
    <>
      <Box mb={5}>
        <Typography variant="h2">Project Details</Typography>
      </Box>
      <Box mb={3}>
        <Paper>
          <Box m={3}>
            <Grid container item spacing={3} xs={12}>
              <Grid container item spacing={3} xs={12} justify="space-between" alignItems="center">
                <Grid item>
                  <Typography variant="h3">Project objectives</Typography>
                </Grid>
                <Grid item>
                  <IconButton title="Edit General Information" aria-label="Edit General Information" onClick={() => {}}>
                    <Typography variant="caption">
                      <Edit fontSize="inherit" /> EDIT
                    </Typography>
                  </IconButton>
                </Grid>
              </Grid>
              <Grid container item spacing={2} xs={12}>
                <Grid item xs={12}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                  aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                  officia deserunt mollit anim id est laborum.
                </Grid>
                <Grid item xs={12}>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                  aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                  officia deserunt mollit anim id est laborum.
                </Grid>
                <Grid item xs={12}></Grid>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
      <Box mb={3}>
        <Paper>
          <Box m={3}>
            <Grid container spacing={3}>
              <Grid container item xs={12} justify="space-between" alignItems="center">
                <Grid item>
                  <Typography variant="h3">General Information</Typography>
                </Grid>
                <Grid item>
                  <IconButton title="Edit General Information" aria-label="Edit General Information" onClick={() => {}}>
                    <Typography variant="caption">
                      <Edit fontSize="inherit" /> EDIT
                    </Typography>
                  </IconButton>
                </Grid>
              </Grid>
              <Grid container item xs={12}>
                <Grid item xs={12} sm={6} md={4}>
                  <Box mr={1} display="inline" color="text.disabled">
                    <Typography variant="caption">Project Name</Typography>
                  </Box>
                  <Box mr={1} display="inline">
                    <Typography variant="subtitle1">{projectData.name}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box mr={1} display="inline" color="text.disabled">
                    <Typography variant="caption">Type</Typography>
                  </Box>
                  <Box mr={1} display="inline">
                    <Typography variant="subtitle1">Placeholder</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box mr={1} display="inline" color="text.disabled">
                    <Typography variant="caption">Timeline</Typography>
                  </Box>
                  <Box mr={1} display="inline">
                    <Typography variant="subtitle1">
                      {getFormattedDateRangeString(
                        DATE_FORMAT.ShortMediumDateFormat,
                        projectData.start_date,
                        projectData.end_date
                      )}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box mr={1} display="inline" color="text.disabled">
                    <Typography variant="caption">Activities</Typography>
                  </Box>
                  <Box mr={1} display="inline">
                    <Typography variant="subtitle1">Placeholder</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box mr={1} display="inline" color="text.disabled">
                    <Typography variant="caption">Climate Change Initiatives</Typography>
                  </Box>
                  <Box mr={1} display="inline">
                    <Typography variant="subtitle1">Placeholder</Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default ProjectDetails;
