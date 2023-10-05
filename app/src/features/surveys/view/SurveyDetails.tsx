import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SurveyParticipants from 'features/surveys/view/components/SurveyParticipants';
import Permits from 'features/surveys/view/components/Permits';
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
    <Paper>
    <Box
      sx={{
        '& h4': {
          mb: 4,
          fontSize: '0.875rem',
          fontWeight: 700,
          textTransform: 'uppercase'
        },
        '& dl': {
          m: 0,
          '& .MuiGrid-item': {
            display: 'flex',
            flexDirection: 'row',
            // flexWrap: 'wrap'
            paddingBottom: 1,
            borderTop: '1px solid #ddd'
          }
        },
        '& dt': {
          display: 'flex',
          flex: '0 0 auto',
          width: '25%',
          typography: 'body1',
          color: 'text.secondary',
          // '&:after': {
          //   content: '" "',
          //   flex: '1 1 auto',
          //   height: '14px',
          //   borderBottom: '1px dotted #999',
          //   ml: 1,
          //   mr: 1
          // }
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

      <Divider sx={{ m: 0 }}></Divider>
      
      <Box p={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>

            <Paper elevation={0} component="section">
              <Typography component="h4">General Information</Typography>
              <SurveyGeneralInformation />
            </Paper>

            <Divider sx={{ my: 3 }}></Divider>

            <Paper elevation={0} component="section">
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

            <Divider sx={{ my: 3 }}></Divider>

            <Paper elevation={0} component="section">
              <Typography component="h4">Purpose and Methodology</Typography>
              <SurveyPurposeAndMethodologyData />
            </Paper>

            <Divider sx={{ my: 3 }}></Divider>

            <Paper elevation={0} component="section">
              <Typography component="h4">Sampling Methods</Typography>
              <Box component="dl" display="flex" flexDirection="row" gap="24px">
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Box component="dt" flex="0 0 auto">Site Selection Strategies</Box>
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
                  <Grid item xs={12}>
                    <Box component="dt" flex="0 0 auto">Stratums</Box>
                    <List 
                      sx={{
                        flex: '1 1 auto',
                        '& .MuiListItem-root': {
                          pt: '2px',
                          mb: 1
                        },
                        '& .MuiListItemText-root': {
                          mt: 0,
                          mb: 0
                        }
                      }} 
                      disablePadding
                    >
                      <ListItem dense disableGutters component="dd">
                        <ListItemText
                          primary="Coniferous forest"
                          secondary="Description of stratum"
                        />
                      </ListItem>
                      <ListItem dense disableGutters component="dd">
                        <ListItemText
                          primary="Low elevation"
                          secondary="Below 500m in elevation"
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12}>
                    <Box component="dt" flex="0 0 auto">Blocks</Box>
                    <List 
                      sx={{
                        flex: '1 1 auto',
                        '& .MuiListItem-root': {
                          pt: '2px',
                          mb: 1
                        },
                        '& .MuiListItemText-root': {
                          mt: 0,
                          mb: 0
                        }
                      }} 
                      disablePadding
                    >
                      <ListItem dense disableGutters component="dd">
                        <ListItemText
                          primary="Block Name"
                          secondary="Description of block"
                        />
                      </ListItem>
                      <ListItem dense disableGutters component="dd">
                      <ListItemText
                          primary="Block Name"
                          secondary="Description of block"
                        />
                      </ListItem>
                      <ListItem dense disableGutters component="dd">
                        <ListItemText
                          primary="Stratum Name"
                          secondary="Description of stratum"
                        />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            <Box component="section" sx={{ display: 'none' }}>
              <Divider sx={{ my: 2 }}></Divider>
              <Typography component="h4">Proprietary Information</Typography>
              <Divider sx={{ my: 2 }}></Divider>
              <SurveyProprietaryData />
            </Box>

            <Divider sx={{ my: 3 }}></Divider>

            <Paper elevation={0} component="section">
              <Typography component="h4">Survey Participants</Typography>
              <SurveyParticipants/>
            </Paper>

            <Divider sx={{ my: 3 }}></Divider>

            <Paper elevation={0} component="section">
              <Typography component="h4">Funding Sources</Typography>
              <SurveyFundingSources />
            </Paper>

            <Divider sx={{ my: 3 }}></Divider>

            <Paper elevation={0} component="section">
              <Typography component="h4">Permits</Typography>
              <Permits />
            </Paper>

            <Divider sx={{ my: 3 }}></Divider>

            <Paper elevation={0} component="section">
              <Typography component="h4">Partnerships</Typography>
              <Partnerships />
            </Paper>

          </Grid>
        </Grid>
      </Box>
    </Box>
    </Paper>
  );
};

export default SurveyDetails;
