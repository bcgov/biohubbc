import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import React from 'react';

export interface IProjectObjectivesProps {
  projectWithDetailsData: IProjectWithDetails;
}

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const ProjectObjectives: React.FC<IProjectObjectivesProps> = (props: any) => {
  const {
    projectWithDetailsData: { objectives }
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
              {objectives.objectives}
            </Grid>
            <Grid item xs={12}></Grid>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ProjectObjectives;
