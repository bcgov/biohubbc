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
import { grey } from '@mui/material/colors';

/**
 * Survey details content for a survey.
 *
 * @return {*}
 */

const SurveyDetails = () => {

  return (
    <Paper>
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
          },
          '& h3': {
            mb: 2,
            flex: '0 0 auto',
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase'
          },
          '& h4': {
            width: {xs: '100%', md: '300px'},
            flex: '0 0 auto',
            color: 'text.secondary'
          },
          '& dl': {
            flex: '1 1 auto',
            m: 0,
          },
          '& dt': {
            flex: '0 0 auto',
            width: {xs: '100%', md: '300px'},
            typography: {xs: 'body2', md: 'body1'},
            color: 'text.secondary'
          },
          '& dd': {
            typography: 'body1',
            color: 'text.primary'
          },
          '& .row': {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: {xs: 'wrap', md: 'nowrap'},
            gap: {xs: 0, md: '24px'},
            py: 1.25,
            borderTop: '1px solid' + grey[300]
          },
          '& section.row': {
            mt: 0
          }
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>

            <Box component="section">
              <Typography component="h3">General Information</Typography>
              <SurveyGeneralInformation />
            </Box>

            <Box component="section">
              <Typography component="h3">Purpose and Methodology</Typography>
              <SurveyPurposeAndMethodologyData />
            </Box>

            <Box component="section">
              <Typography component="h3">Sampling Methods</Typography>
              <SamplingMethods />
            </Box>

            <Box component="section" sx={{display: 'none'}}>
              <Typography component="h3">Survey Participants</Typography>
              <SurveyParticipants/>
            </Box>

            <Box component="section">
              <Typography component="h3">Funding Sources & Partnerships</Typography>
              <SurveyFundingSources />
              <Partnerships />
            </Box>

            <Box component="section">
              <Typography component="h3">Permits</Typography>
              <Permits />
            </Box>

            <Box component="section">
              <Typography component="h3">Proprietary Information</Typography>
              <SurveyProprietaryData />
            </Box>

            <Box component="section" sx={{display: 'none !important'}}>
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
            </Box>

          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SurveyDetails;
