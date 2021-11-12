import Box from '@material-ui/core/Box';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import SurveyGeneralInformation from 'features/surveys/view/components/SurveyGeneralInformation';
import SurveyProprietaryData from 'features/surveys/view/components/SurveyProprietaryData';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React from 'react';

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
 * Survey details content for a survey.
 *
 * @return {*}
 */
const SurveyDetails: React.FC<ISurveyDetailsProps> = (props) => {
  const { surveyForViewData, codes, refresh, projectForViewData } = props;

  const classes = useStyles();

  return (
    <>
      <Box display="flex" alignItems="center" minHeight="64px">
        <Typography variant="h2">Survey Details</Typography>
      </Box>

      <Box display="flex" justifyContent="space-between">
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
