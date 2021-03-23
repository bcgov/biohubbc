import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';

export interface IPartnershipsProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Partnerships content for a project.
 *
 * @return {*}
 */
const Partnerships: React.FC<IPartnershipsProps> = (props) => {
  const {
    projectForViewData: {
      partnerships: { indigenous_partnerships, stakeholder_partnerships }
    }
  } = props;

  const indigenous_partnerships_names = (indigenous_partnerships?.length && indigenous_partnerships.join(', ')) || '';
  const stakeholder_partnerships_names =
    (stakeholder_partnerships?.length && stakeholder_partnerships.join(', ')) || '';

  return (
    <>
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Partnerships</Typography>
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
              <Typography variant="caption">Indigenous Partnerships</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{indigenous_partnerships_names}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Stakeholder Partnerships</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{stakeholder_partnerships_names}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Partnerships;
