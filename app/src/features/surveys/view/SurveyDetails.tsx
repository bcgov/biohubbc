import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import SurveyGeneralInformation from 'features/surveys/view/components/SurveyGeneralInformation';
import SurveyProprietaryData from 'features/surveys/view/components/SurveyProprietaryData';
import React from 'react';
import { IGetProjectSurveyForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import SurveyStudyArea from './components/SurveyStudyArea';

export interface ISurveyDetailsProps {
  surveyForViewData: IGetProjectSurveyForViewResponse;
  codes: IGetAllCodeSetsResponse;
}

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
  }
}));

/**
 * Details content for a survey.
 *
 * @return {*}
 */
const SurveyDetails: React.FC<ISurveyDetailsProps> = (props) => {
  const classes = useStyles();

  const { surveyForViewData, codes } = props;

  return (
    <>
      <Box mb={6}>
        <Typography variant="h2">Survey Details</Typography>
      </Box>

      <Box component={Paper} p={4}>
        <Box component="section" className={classes.surveyDetailsSection}>
          <SurveyGeneralInformation surveyForViewData={surveyForViewData} codes={codes} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.surveyDetailsSection}>
          <SurveyStudyArea surveyForViewData={surveyForViewData} />
        </Box>
      </Box>

      <Box component={Paper} p={4} mt={4}>
        <Box component="section" className={classes.surveyDetailsSection}>
          <SurveyProprietaryData surveyForViewData={surveyForViewData} />
        </Box>
      </Box>
    </>
  );
};

export default SurveyDetails;
