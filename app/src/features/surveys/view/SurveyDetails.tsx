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
import {
  mdiInformationOutline,
  mdiLightbulbOnOutline,
  mdiAccountMultipleOutline,
  mdiHandshakeOutline,
  mdiCurrencyUsd,
  mdiClipboardCheckOutline
} from '@mdi/js';
import Icon from '@mdi/react';

const useStyles = makeStyles((theme: Theme) => ({
  surveyMetadataContainer: {
    '& section + section': {
      marginTop: theme.spacing(3)
    },
    '& h4': {
      fontSize: '0.9375rem',
      fontWeight: 700,
      textTransform: 'uppercase'
    },
    '& section + hr': {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3)
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
        '& dl': {
          m: 0,
          '& .MuiGrid-item': {
            display: 'flex',
            flexDirection: 'row',
            gap: '24px',
          }
        },
        '& dt': {
          flex: '0 0 auto', 
          width: '33.3333%',
          typography: 'body1',
        },
        '& dd': {
          m: 0,
          flex: '1 1 auto',
          typography: 'body1',
          color: 'text.secondary'
        },
      }}
    >
      <Toolbar>
        <Typography variant="h4" component="h2">
          Survey Details
        </Typography>
      </Toolbar>
      <Divider sx={{m: 0}}></Divider>
      <Box p={3}>
        <Grid container spacing={3}>
          <Grid item md={12}>
            <Box component="section">
              <Box display="flex" flexDirection="row" alignItems="center">
                <Icon path={mdiInformationOutline} size={1}/>
                <Typography component="h4" sx={{ml: 1.5}}>General Information</Typography>
              </Box>
              <Divider sx={{my: 2}}></Divider>
              <SurveyGeneralInformation />
            </Box>
            <Box component="section">
              <Divider sx={{my: 2}}></Divider>
              <Box display="flex" flexDirection="row" alignItems="center">
                <Icon path={mdiLightbulbOnOutline} size={1}/>
                <Typography component="h4" sx={{ml: 1.5}}>Purpose and Methodology</Typography>
              </Box>
              <Divider sx={{my: 2}}></Divider>
              <SurveyPurposeAndMethodologyData />
            </Box>
            <Box component="section">
              <Divider sx={{my: 2}}></Divider>
              <Box display="flex" flexDirection="row" alignItems="center">
                <Icon path={mdiAccountMultipleOutline} size={1}/>
                <Typography component="h4" sx={{ml: 1.5}}>Survey Particpants</Typography>
              </Box>
              <Divider sx={{my: 2}}></Divider>
              <Box component="dl" display="flex" flexDirection="row" gap="24px">
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Box component="dt" flex="0 0 auto" width="50%">Pilot(s)</Box>
                    <Box component="dd" flex="1 1 auto">John Smith</Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box component="dt" flex="0 0 auto" width="50%">Biologist(s)</Box>
                    <Box flex="1 1 auto">
                      <Box component="dd">Artur Margarit</Box>
                      <Box component="dd">Jane Doe</Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
            <Box component="section" sx={{display: 'none'}}>
              <Divider sx={{my: 2}}></Divider>
              <Typography component="h4">Proprietary Information</Typography>
              <Divider sx={{my: 2}}></Divider>
              <SurveyProprietaryData />
            </Box>
            <Box component="section">
              <Divider sx={{my: 2}}></Divider>
              <Box display="flex" flexDirection="row" alignItems="center">
                <Icon path={mdiHandshakeOutline} size={1}/>
                <Typography component="h4" sx={{ml: 1.5}}>Partnerships</Typography>
              </Box>
              <Divider sx={{my: 2}}></Divider>
              <Partnerships />
            </Box>
          </Grid>
          <Grid item md={12}>
            <Box component="section">
              <Box display="flex" flexDirection="row" alignItems="center">
                <Icon path={mdiCurrencyUsd} size={1}/>
                <Typography component="h4" sx={{ml: 1.5}}>Funding Sources</Typography>
              </Box>
              <Divider sx={{my: 2}}></Divider>
              <SurveyFundingSources />
            </Box>
            <Box component="section">
              <Box display="flex" flexDirection="row" alignItems="center">
                <Icon path={mdiClipboardCheckOutline} size={1}/>
                <Typography component="h4" sx={{ml: 1.5}}>Permits</Typography>
              </Box>
              <Divider sx={{my: 2}}></Divider>
              <SurveyFundingSources />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SurveyDetails;
