import Box from '@material-ui/core/Box';
import { grey } from '@material-ui/core/colors';
import Divider from '@material-ui/core/Divider';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SurveyProprietaryData from 'features/surveys/view/components/SurveyProprietaryData';
import SurveyPurposeAndMethodologyData from 'features/surveys/view/components/SurveyPurposeAndMethodologyData';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import SurveyGeneralInformation from './components/SurveyGeneralInformation';

const useStyles = makeStyles((theme: Theme) => ({
  surveyMetadataContainer: {
    '& section + section': {
      marginTop: theme.spacing(4)
    },
    '& dt': {
      flex: '0 0 40%'
    },
    '& dd': {
      flex: '1 1 auto'
    },
    '& .MuiListItem-root': {
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5)
    },
    '& .MuiListItem-root:first-of-type': {
      paddingTop: 0
    },
    '& .MuiListItem-root:last-of-type': {
      paddingBottom: 0
    },
    '& h4': {
      fontSize: '14px',
      fontWeight: 700,
      letterSpacing: '0.02rem',
      textTransform: 'uppercase',
      color: grey[600],
      '& + hr': {
        marginTop: theme.spacing(1.5),
        marginBottom: theme.spacing(1.5)
      }
    }
  }
}));

export interface ISurveyDetailsProps {
  codes: IGetAllCodeSetsResponse;
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Survey details content for a survey.
 *
 * @return {*}
 */
const SurveyDetails: React.FC<ISurveyDetailsProps> = (props) => {
  const classes = useStyles();
  const { codes, projectForViewData } = props;

  return (
    <Box className={classes.surveyMetadataContainer}>
      <Toolbar>
        <Typography variant="h4" component="h2">
          Survey Details
        </Typography>
      </Toolbar>
      <Divider></Divider>
      <Box p={3}>
        <SurveyGeneralInformation
          projectForViewData={projectForViewData}
          codes={codes}
        />
        <Box component="section">
          <Typography component="h4">Purpose and Methodology</Typography>
          <Divider></Divider>
          <SurveyPurposeAndMethodologyData
            projectForViewData={projectForViewData}
            codes={codes}
          />
        </Box>
        <Box component="section">
          <Typography component="h4">Proprietary Information</Typography>
          <Divider></Divider>
          <SurveyProprietaryData
            projectForViewData={projectForViewData}
            codes={codes}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default SurveyDetails;
