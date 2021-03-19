import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface ISpeciesProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Species content for a project.
 *
 * @return {*}
 */
const Species: React.FC<ISpeciesProps> = (props) => {
  const {
    projectForViewData: {
      species: { focal_species, ancillary_species }
    }
  } = props;

  const focal_species_names = (focal_species?.length && focal_species.join(', ')) || '';
  const ancillary_species_names = (ancillary_species?.length && ancillary_species.join(', ')) || '';

  return (
    <>
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Species</Typography>
          </Grid>
          <Grid item>
            <IconButton title="Edit Species Information" aria-label="Edit Species Information">
              <Typography variant="caption">
                <Edit fontSize="inherit" /> EDIT
              </Typography>
            </IconButton>
          </Grid>
        </Grid>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Focal Species</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{focal_species_names}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Ancillary Species</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{ancillary_species_names}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Species;
