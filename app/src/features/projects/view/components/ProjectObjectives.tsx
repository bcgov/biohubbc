import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import React from 'react';
import ReadMoreField from 'components/fields/ReadMoreField';

export interface IProjectObjectivesProps {
  projectWithDetailsData: IProjectWithDetails;
}

/**
 * Project objectives content for a project.
 *
 * @return {*}
 */
const ProjectObjectives: React.FC<IProjectObjectivesProps> = (props) => {
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
              <IconButton title="Edit Objectives Information" aria-label="Edit Objectives Information">
                <Typography variant="caption">
                  <Edit fontSize="inherit" /> EDIT
                </Typography>
              </IconButton>
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={12}>
            <ReadMoreField text={objectives.objectives} max_char_length={850} />
          </Grid>

          <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h3">Project Caveats</Typography>
            </Grid>
          </Grid>
          <Grid container item spacing={2} xs={12}>
            <ReadMoreField text={objectives.caveats} max_char_length={850} />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default ProjectObjectives;
