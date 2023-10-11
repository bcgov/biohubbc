import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
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
import SurveyStudyArea from './components/SurveyStudyArea';
import Partnerships from './components/Partnerships';
import SamplingMethods from './components/SamplingMethods';
import Grid from '@mui/material/Grid';
import { grey } from '@mui/material/colors';
import { useHistory } from 'react-router';
import Icon from '@mdi/react';
import { mdiPencilOutline } from '@mdi/js';

/**
 * Survey details content for a survey.
 *
 * @return {*}
 */

const SurveyDetails = () => {

  const history = useHistory();

  return (
    <Paper>
      <Toolbar>
        <Typography variant="h4" component="h2" sx={{flex: '1 1 auto'}}>
          Survey Details
        </Typography>
        <IconButton
          aria-label="Edit Details"
          onClick={() => history.push('edit')}
        >
          <Icon path={mdiPencilOutline} size={1} />
        </IconButton>

      </Toolbar>

      <Divider sx={{ m: 0 }}></Divider>
      
      <Box p={3}
        sx={{
          // '& section': {
          //   display: 'flex',
          //   flexDirection: 'row'
          // },
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
            py: 1,
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

            <Divider sx={{ my: 3 }}></Divider>

            <Box component="section">
              <Typography component="h3">Study Area Location</Typography>
              <SurveyStudyArea />
            </Box>
            
            <Divider sx={{ my: 3 }}></Divider>

            <Box component="section">
              <Typography component="h3">Purpose and Methodology</Typography>
              <SurveyPurposeAndMethodologyData />
            </Box>
            
            <Divider sx={{ my: 3 }}></Divider>

            <Box component="section">
              <Typography component="h3">Sampling Methods</Typography>
              <SamplingMethods />
            </Box>

            <Divider sx={{ my: 3 }}></Divider>

            <Box component="section">
              <Typography component="h3">Survey Participants</Typography>
              <SurveyParticipants/>
            </Box>

            <Divider sx={{ my: 3 }}></Divider>

            <Box component="section">
              <Typography component="h3">Funding Sources & Partnerships</Typography>
              <Box flex="1 1 auto">
                <SurveyFundingSources />
                <Partnerships />
              </Box>
            </Box>

            <Divider sx={{ my: 3 }}></Divider>

            <Box component="section">
              <Typography component="h3">Permits</Typography>
              <Permits />
            </Box>

            <Divider sx={{ my: 3 }}></Divider>

            <Box component="section">
              <Typography component="h3">Proprietary Information</Typography>
              <SurveyProprietaryData />
            </Box>

          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SurveyDetails;
