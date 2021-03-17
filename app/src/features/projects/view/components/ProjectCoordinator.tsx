import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import React from 'react';
import { IProjectWithDetails } from 'interfaces/project-interfaces';

export interface IProjectDetailsProps {
  projectWithDetailsData: IProjectWithDetails;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectCoordinator: React.FC<IProjectDetailsProps> = (props) => {
  const {
    projectWithDetailsData: { coordinator }
  } = props;

  console.log('-----------------------coordinator');
  console.log(coordinator);

  return (
    <>
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Project Coordinator</Typography>
          </Grid>
          <Grid item>
            <IconButton title="Edit Project Coordinator" aria-label="Edit Project Coordinator">
              <Typography variant="caption">
                <Edit fontSize="inherit" /> EDIT
              </Typography>
            </IconButton>
          </Grid>
        </Grid>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Name</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">
                {coordinator.first_name} {coordinator.last_name}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Email Address</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{coordinator.email_address}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Agency</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{coordinator.coordinator_agency}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default ProjectCoordinator;
