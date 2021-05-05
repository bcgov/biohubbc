import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import SurveyGeneralInformation from 'features/surveys/view/components/SurveyGeneralInformation';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  surveyDetailsSection: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(5),
    '&:last-child': {
      marginBottom: 0
    },
    '&:first-child': {
      marginTop: 0
    }
  },
  sectionDivider: {
    height: '3px'
  }
}));

/**
 * Project details content for a survey.
 *
 * @return {*}
 */
const SurveyDetails = () => {
  const classes = useStyles();

  return (
    <>
      <Box mb={6}>
        <Typography variant="h2">Survey Details</Typography>
      </Box>

      <Box component={Paper} p={4}>
        <Box component="section" className={classes.surveyDetailsSection}>
          <SurveyGeneralInformation />
        </Box>
      </Box>
    </>
  );
};

export default SurveyDetails;
