import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SurveyParticipants from 'features/surveys/view/components/SurveyParticipants';
import Permits from 'features/surveys/view/components/Permits';
import SurveyProprietaryData from 'features/surveys/view/components/SurveyProprietaryData';
import SurveyPurposeAndMethodologyData from 'features/surveys/view/components/SurveyPurposeAndMethodologyData';
import SurveyFundingSources from './components/SurveyFundingSources';
import SurveyGeneralInformation from './components/SurveyGeneralInformation';
import Partnerships from './components/Partnerships';
import SamplingMethods from './components/SamplingMethods';
import Grid from '@mui/material/Grid';

/**
 * Survey details content for a survey.
 *
 * @return {*}
 */

const SurveyDetails = () => {

  return (
    <Paper>
    <Box
      sx={{
        '& h4': {
          mb: 2,
          fontSize: '0.875rem',
          fontWeight: 700,
          textTransform: 'uppercase'
        },
        '& dl': {
          m: 0
        },
        '& dt': {
          display: 'inline-block',
          flex: '0 0 auto',
          width: {sm: '100%', md: '25%'},
          typography: {sm: 'body2', md: 'body1'},
          color: 'text.secondary'
        },
        '& dd': {
          ml: 0,
          display: 'inline-block',
          typography: 'body1',
          color: 'text.primary'
        },
      }}
    >
      <Toolbar>
        <Typography variant="h4" component="h2">
          Survey Details
        </Typography>
      </Toolbar>

      <Divider sx={{ m: 0 }}></Divider>
      
      <Box p={3}
        sx={{
          '& section + section': {
            mt: 3
          }
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>

            <Paper elevation={0} component="section">
              <Typography component="h4">General Information</Typography>
              <SurveyGeneralInformation />
            </Paper>

            <Paper elevation={0} component="section">
              <Typography component="h4">Purpose and Methodology</Typography>
              <SurveyPurposeAndMethodologyData />
            </Paper>

            <Paper elevation={0} component="section">
              <Typography component="h4">Sampling Methods</Typography>
              <SamplingMethods />
            </Paper>

            <Paper elevation={0} component="section" sx={{display: 'none'}}>
              <Typography component="h4">Survey Participants</Typography>
              <SurveyParticipants/>
            </Paper>

            <Box component="section" sx={{ display: 'none' }}>
              <Divider sx={{ my: 2 }}></Divider>
              <Typography component="h4">Proprietary Information</Typography>
              <Divider sx={{ my: 2 }}></Divider>
              <SurveyProprietaryData />
            </Box>

            <Paper elevation={0} component="section">
              <Typography component="h4">Funding Sources</Typography>
              <SurveyFundingSources />
            </Paper>

            <Paper elevation={0} component="section">
              <Typography component="h4">Partnerships</Typography>
              <Partnerships />
            </Paper>

            <Paper elevation={0} component="section">
              <Typography component="h4">Permits</Typography>
              <Permits />
            </Paper>

            <Paper elevation={0} component="section" sx={{display: 'none'}}>
              <Typography component="h4">Study Area Location</Typography>
              <Box component="dl" display="flex" flexDirection="row" gap="24px">
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Box component="dt">Area Name</Box>
                    <Box component="dd">My Study Area Name</Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box component="dt" flex="0 0 auto">Natural Resource Ministry Regions</Box>
                    <Box flex="1 1 auto"
                      sx={{
                        '& dd': {
                          position: 'relative',
                          display: 'inline-block',
                          mr: 0.75
                        },
                        '& dd:not(:last-child):after': {
                          content: '", "'
                        }
                      }}
                    >
                      <Box component="dd">Omenica Region</Box>
                      <Box component="dd">Peace Region</Box>
                      <Box component="dd">Skeena Region</Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box component="dt">Ministry of Environment Regions</Box>
                    <Box flex="1 1 auto"
                      sx={{
                        '& dd': {
                          position: 'relative',
                          display: 'inline-block',
                          mr: 0.75
                        },
                        '& dd:not(:last-child):after': {
                          content: '", "'
                        }
                      }}
                    >
                      <Box component="dd">Omenica Region</Box>
                      <Box component="dd">Peace Region</Box>
                      <Box component="dd">Skeena Region</Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box component="dt">Parks and Eco-reserves</Box>
                    <Box
                      sx={{
                        '& dd': {
                          position: 'relative',
                          display: 'inline-block',
                          mr: 0.75
                        },
                        '& dd:not(:last-child):after': {
                          content: '", "'
                        }
                      }}
                    >
                      <Box component="dd">Park One</Box>
                      <Box component="dd">Park Two</Box>
                      <Box component="dd">Park Three</Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

          </Grid>
        </Grid>
      </Box>
    </Box>
    </Paper>
  );
};

export default SurveyDetails;
