import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SurveyProprietaryData from 'features/surveys/view/components/SurveyProprietaryData';
import SurveyPurposeAndMethodologyData from 'features/surveys/view/components/SurveyPurposeAndMethodologyData';
import SurveyFundingSources from './components/SurveyFundingSources';
import SurveyGeneralInformation from './components/SurveyGeneralInformation';
import Partnerships from './Partnerships';
import Grid from '@mui/material/Grid';
// import {
//   mdiInformationOutline,
//   mdiLightbulbOnOutline,
//   mdiAccountMultipleOutline,
//   mdiHandshakeOutline,
//   mdiCurrencyUsd,
//   mdiClipboardCheckOutline
// } from '@mdi/js';
// import Icon from '@mdi/react';

/**
 * Survey details content for a survey.
 *
 * @return {*}
 */

const SurveyDetails = () => {

  return (
    <Box
      sx={{
        '& h4': {
          mb: 2,
          fontSize: '1.125rem',
          fontWeight: 700
        },
        '& dl': {
          m: 0,
          '& .MuiGrid-item': {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap'
          }
        },
        '& dt': {
          flex: '0 0 auto', 
          width: '100%',
          typography: 'body2',
          color: 'text.secondary'
        },
        '& dd': {
          ml: 0,
          flex: '1 1 auto',
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
      <Divider sx={{m: 0}}></Divider>
      <Box p={3}>
        <Grid container spacing={3}>
          <Grid item md={6}>
            <Box component="section">
              <Typography component="h4">General</Typography>
              <SurveyGeneralInformation />
            </Box>

            <Divider sx={{my: 3}}/>
            
            <Box component="section">
              <Typography component="h4">Location / Study Area</Typography>
              <Box component="dl" display="flex" flexDirection="row" gap="24px">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box component="dt">Name</Box>
                    <Box component="dd">My Study Area Name</Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box component="dt" flex="0 0 auto">Natural Resource Ministry Region(s):</Box>
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
                    <Box component="dt">Ministry of Environment Regions(s):</Box>
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

            <Divider sx={{my: 3}}/>

            <Box component="section">
              <Typography component="h4">Purpose and Methodology</Typography>
              <SurveyPurposeAndMethodologyData />
            </Box>

            <Divider sx={{my: 3}}/>
            
            <Box component="section">
              <Typography component="h4">Sampling Methods</Typography>
              <Box component="dl" display="flex" flexDirection="row" gap="24px">
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Box component="dt" flex="0 0 auto" width="50%">Site Selection Strategies</Box>
                    <Box flex="1 1 auto"
                      sx={{
                        '& dd': {
                          position: 'relative',
                          display: 'inline-block',
                          mr: 0.75
                        },
                        '& dd:not(:last-child):after': {
                          content: '","'
                        }
                      }}
                    >
                      <Box component="dd">Strategy 1</Box>
                      <Box component="dd">Strategy 2</Box>
                      <Box component="dd">Strategy 3</Box>
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

          </Grid>
          <Grid item md={6}>
            <Box component="section">
              <Typography component="h4">Survey Particpants</Typography>
              <Box component="dl" display="flex" flexDirection="row">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box component="dt">Pilot(s)</Box>
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
                      <Box component="dd">John Smith</Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box component="dt">Biologist(s)</Box>
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
                      <Box component="dd">Artur Margarit</Box>
                      <Box component="dd">Jane Doe</Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            <Divider sx={{my: 3}}/>

            <Box component="section">
              <Typography component="h4">Partnerships</Typography>
              <Partnerships />
            </Box>

            <Divider sx={{my: 3}}/>

            <Box component="section">
              <Typography component="h4">Funding Sources</Typography>
              <SurveyFundingSources />
            </Box>

            <Divider sx={{my: 3}}/>
            
            <Box component="section">
              <Typography component="h4">Permits</Typography>
              <SurveyFundingSources />
            </Box>

          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default SurveyDetails;
