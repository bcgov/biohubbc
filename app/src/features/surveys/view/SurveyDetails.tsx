import { mdiPencil } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ProjectRoleGuard } from 'components/security/Guards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import Permits from 'features/surveys/view/components/Permits';
import SurveyParticipants from 'features/surveys/view/components/SurveyParticipants';
import SurveyProprietaryData from 'features/surveys/view/components/SurveyProprietaryData';
import SurveyPurposeAndMethodologyData from 'features/surveys/view/components/SurveyPurposeAndMethodologyData';
import { PropsWithChildren } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Partnerships from './components/Partnerships';
import SamplingMethods from './components/SamplingMethods';
import SurveyFundingSources from './components/SurveyFundingSources';
import SurveyGeneralInformation from './components/SurveyGeneralInformation';
import SurveyStudyArea from './components/SurveyStudyArea';

/**
 * Survey details content for a survey.
 *
 * @return {*}
 */

const SurveyDetails = () => {
  return (
    <Paper>
      <Toolbar>
        <Typography variant="h4" component="h2" sx={{ flex: '1 1 auto' }}>
          Survey Details
        </Typography>
        <ProjectRoleGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            aria-label="Edit Details"
            to="edit"
            startIcon={<Icon path={mdiPencil} size={0.75} />}>
            Edit
          </Button>
        </ProjectRoleGuard>
      </Toolbar>

      <Divider sx={{ m: 0 }}></Divider>
      <DetailsWrapper>
        <Box component="section">
          <Typography component="h3">General Information</Typography>
          <SurveyGeneralInformation />
        </Box>

        <Box component="section">
          <Typography component="h3">Study Area Location</Typography>
          <SurveyStudyArea />
        </Box>

        <Box component="section">
          <Typography component="h3">Purpose and Methodology</Typography>
          <SurveyPurposeAndMethodologyData />
        </Box>

        <Box component="section">
          <Typography component="h3">Sampling Methods</Typography>
          <SamplingMethods />
        </Box>

        <Box component="section">
          <Typography component="h3">Survey Participants</Typography>
          <SurveyParticipants />
        </Box>

        <Box component="section">
          <Typography component="h3">Funding Sources & Partnerships</Typography>
          <Box flex="1 1 auto">
            <SurveyFundingSources />
            <Partnerships />
          </Box>
        </Box>

        <Box component="section">
          <Typography component="h3">Permits</Typography>
          <Permits />
        </Box>

        <Box component="section">
          <Typography component="h3">Proprietary Information</Typography>
          <SurveyProprietaryData />
        </Box>
      </DetailsWrapper>
    </Paper>
  );
};

export const DetailsWrapper = (props: PropsWithChildren) => (
  <Stack
    divider={<Divider />}
    p={3}
    sx={{
      '& h3': {
        mb: 2,
        flex: '0 0 auto',
        fontSize: '0.875rem',
        fontWeight: 700,
        textTransform: 'uppercase'
      },
      '& h4': {
        width: { xs: '100%', md: '300px' },
        flex: '0 0 auto',
        color: 'text.secondary'
      },
      '& dl': {
        flex: '1 1 auto',
        m: 0
      },
      '& dt': {
        flex: '0 0 auto',
        width: { xs: '100%', md: '300px' },
        typography: { xs: 'body2', md: 'body1' },
        color: 'text.secondary'
      },
      '& dd': {
        typography: 'body1',
        color: 'text.primary'
      },
      '& .row': {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: { xs: 'wrap', md: 'nowrap' },
        gap: { xs: 0, md: '24px' },
        mt: 0,
        py: 1,
        borderTop: '1px solid ' + grey[300]
      },
      '& hr': {
        my: 3
      }
    }}>
    {props.children}
  </Stack>
);

export default SurveyDetails;
