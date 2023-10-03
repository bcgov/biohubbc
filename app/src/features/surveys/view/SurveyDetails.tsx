import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import SurveyProprietaryData from 'features/surveys/view/components/SurveyProprietaryData';
import SurveyPurposeAndMethodologyData from 'features/surveys/view/components/SurveyPurposeAndMethodologyData';
import SurveyFundingSources from './components/SurveyFundingSources';
import SurveyGeneralInformation from './components/SurveyGeneralInformation';
import Partnerships from './Partnerships';
import Grid from '@mui/material/Grid';

const useStyles = makeStyles((theme: Theme) => ({
  surveyMetadataContainer: {
    '& section + section': {
      marginTop: theme.spacing(4)
    },
    '& h4': {
      fontSize: '14px',
      fontWeight: 700,
      letterSpacing: '0.02rem',
      textTransform: 'uppercase',
      '& + hr': {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2)
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
    <Box className={classes.surveyMetadataContainer}
      sx={{
        '& dt': {
          flex: '0 0 auto', 
          width: '200px',
          typography: 'body1',
          color: 'text.secondary'
        },
        '& dd': {
          m: 0,
          flex: '1 1 auto',
          typography: 'body1'
        },
      }}
    >
      <Toolbar>
        <Typography variant="h4" component="h2">
          Survey Details
        </Typography>
      </Toolbar>
      <Divider></Divider>
      <Box p={3}>
        <Grid container spacing={3}>
          <Grid item md={6}>
            <Box component="section">
              <Typography component="h4">General Information</Typography>
              <Divider></Divider>
              <SurveyGeneralInformation />
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
          </Grid>
          <Grid item md={6}>
            <Box component="section">
              <Typography component="h4">Survey Participants</Typography>
              <Divider></Divider>
              <Box component="dl">
                <dt>Pilot(s)</dt>
                <dd>John Smith</dd>
              </Box>
              <Box component="dl">
                <dt>Biologists(s)</dt>
                <Box>
                  <dd>Artur Margarit</dd>
                  <dd>Jane Doe</dd>
                </Box>
              </Box>
            </Box>
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
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SurveyDetails;
