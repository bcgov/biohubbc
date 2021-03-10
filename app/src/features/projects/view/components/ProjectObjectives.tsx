import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import React from 'react';

export interface IProjectDetailsProps {
  projectData: any;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectObjectives: React.FC<IProjectDetailsProps> = (props: any) => {
  const {
    projectData: { objectives }
  } = props;

  return (
    <>
      <Box m={3}>
        <Grid container spacing={3}>
          <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h3">Project Objectives</Typography>
            </Grid>
            <Grid item>
              <IconButton title="Edit General Information" aria-label="Edit General Information">
                <Typography variant="caption">
                  <Edit fontSize="inherit" /> EDIT
                </Typography>
              </IconButton>
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={12}>
            <Grid item xs={12}>
              {objectives}
            </Grid>
            <Grid item xs={12}></Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ProjectObjectives;
