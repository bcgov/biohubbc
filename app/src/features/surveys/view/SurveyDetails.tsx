import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import SurveyGeneralInformation from 'features/surveys/view/components/SurveyGeneralInformation';
import SurveyProprietaryData from 'features/surveys/view/components/SurveyProprietaryData';
import React from 'react';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
//import SurveyStudyArea from './components/SurveyStudyArea';

export interface ISurveyDetailsProps {
  surveyForViewData: IGetSurveyForViewResponse;
  codes: IGetAllCodeSetsResponse;
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
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
  const { surveyForViewData, codes, refresh, projectForViewData } = props;

  const classes = useStyles();

  return (
    <>
      <Box mb={5}>
        <Typography variant="h2">Survey Details</Typography>
      </Box>

      <Box component={Paper} p={4}>
        <Box component="section" className={classes.surveyDetailsSection}>
          <SurveyGeneralInformation
            projectForViewData={projectForViewData}
            surveyForViewData={surveyForViewData}
            codes={codes}
            refresh={refresh}
          />
           <SurveyProprietaryData
              projectForViewData={projectForViewData}
              surveyForViewData={surveyForViewData}
              codes={codes}
              refresh={refresh}
            />
        </Box>
      </Box>

     
    </>
  );
};

export default SurveyDetails;
