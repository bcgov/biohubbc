import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import SurveyProprietaryData from 'features/surveys/view/components/SurveyProprietaryData';
import SurveyPurposeAndMethodologyData from 'features/surveys/view/components/SurveyPurposeAndMethodologyData';
import SurveyFundingSources from './components/SurveyFundingSources';
import SurveyGeneralInformation from './components/SurveyGeneralInformation';
import Partnerships from './Partnerships';

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

/**
 * Survey details content for a survey.
 *
 * @return {*}
 */
const SurveyDetails = () => {
  const classes = useStyles();

  return (
    <Box className={classes.surveyMetadataContainer}>
      <Toolbar>
        <Typography variant="h4" component="h2">
          Survey Details
        </Typography>
      </Toolbar>
      <Divider></Divider>
      <Box p={3}>
        <SurveyGeneralInformation />
        <Box component="section">
          <Typography component="h4">Funding Sources</Typography>
          <Divider></Divider>
          <SurveyFundingSources />
        </Box>
        <Box component="section">
          <Typography component="h4">Partnerships</Typography>
          <Divider></Divider>
          <Partnerships />
        </Box>
        <Box component="section">
          <Typography component="h4">Purpose and Methodology</Typography>
          <Divider></Divider>
          <SurveyPurposeAndMethodologyData />
        </Box>
        <Box component="section">
          <Typography component="h4">Proprietary Information</Typography>
          <Divider></Divider>
          <SurveyProprietaryData />
        </Box>
      </Box>
    </Box>
  );
};

export default SurveyDetails;
