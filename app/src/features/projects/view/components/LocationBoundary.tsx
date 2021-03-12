import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import React from 'react';

export interface IProjectDetailsProps {
  projectWithDetailsData: IProjectWithDetails;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const LocationBoundary: React.FC<IProjectDetailsProps> = (props: any) => {
  const {
    projectWithDetailsData: { location }
  } = props;

  console.log('geometry', location.geometry);

  return (
    <>
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Location / Project Boundary</Typography>
          </Grid>
          <Grid item>
            <IconButton title="Edit General Information" aria-label="Edit General Information">
              <Typography variant="caption">
                <Edit fontSize="inherit" /> EDIT
              </Typography>
            </IconButton>
          </Grid>
        </Grid>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Region(s)</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{location.regions.join(", ")}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Location Description</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{location.location_description}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default LocationBoundary;
