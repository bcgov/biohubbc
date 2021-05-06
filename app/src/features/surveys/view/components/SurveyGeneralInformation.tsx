import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import React from 'react';

/**
 * General information content for a survey.
 *
 * @return {*}
 */
const SurveyGeneralInformation = () => {
  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
        <Typography variant="h3">General Information</Typography>
        <Button
          variant="text"
          color="primary"
          className="sectionHeaderButton"
          onClick={() => {}}
          title="Edit General Information"
          aria-label="Edit General Information"
          startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
          Edit
        </Button>
      </Box>
      <dl>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Survey Name
            </Typography>
            <Typography component="dd" variant="body1">
              Moose Survey 1
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Management Unit
            </Typography>
            <Typography component="dd" variant="body1">
              Management Unit 1
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Survey Timeline
            </Typography>
            <Typography component="dd" variant="body1">
              MMM DD, YYYY - MMM DD, YYYY
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Species
            </Typography>
            <Typography component="dd" variant="body1">
              Moose
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography component="dt" variant="subtitle2" color="textSecondary">
              Survey Lead
            </Typography>
            <Typography component="dd" variant="body1">
              John Smith
            </Typography>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item>
            <Box mt={1}>
              <Box display="flex" alignItems="center" justifyContent="space-between" height="2rem">
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Purpose
                </Typography>
              </Box>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box mt={1}>
              <Box display="flex" alignItems="center" justifyContent="space-between" height="2rem">
                <Typography component="dt" variant="subtitle2" color="textSecondary">
                  Study Area Definition
                </Typography>
              </Box>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </dl>
    </Box>
  );
};

export default SurveyGeneralInformation;
