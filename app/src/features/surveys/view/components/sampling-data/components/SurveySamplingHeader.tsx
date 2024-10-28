import { mdiCog } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { ProjectRoleGuard } from 'components/security/Guards';
import { SamplingInformationHelpI18N } from 'constants/help-i18n';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { Link as RouterLink } from 'react-router-dom';

export const SurveySamplingHeader = () => {
  return (
    <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
      <Typography variant="h2" flex="1 1 auto">
        Sampling Information
      </Typography>
      <Stack gap={1} direction="row">
        <HelpButtonDialog
          dialogTitle={SamplingInformationHelpI18N.infoTitle}
          dialogText={SamplingInformationHelpI18N.infoText}
          dialogContent={
            <>
              <Box my={3}>
                <Typography component="legend">{SamplingInformationHelpI18N.techniqueTitle}</Typography>
                <Typography color="textSecondary">{SamplingInformationHelpI18N.techniqueInfoText}</Typography>
              </Box>
              <Box mb={3}>
                <Typography component="legend">{SamplingInformationHelpI18N.siteTitle}</Typography>
                <Typography color="textSecondary">{SamplingInformationHelpI18N.siteInfoText}</Typography>
              </Box>
              <Box mb={3}>
                <Typography component="legend">{SamplingInformationHelpI18N.periodTitle}</Typography>
                <Typography color="textSecondary">{SamplingInformationHelpI18N.periodInfoText}</Typography>
              </Box>
            </>
          }
        />
        <ProjectRoleGuard
          validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
          validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <Button
            component={RouterLink}
            variant="contained"
            color="primary"
            aria-label="Manage Sampling Information"
            to="sampling"
            startIcon={<Icon path={mdiCog} size={0.75}></Icon>}>
            Manage
          </Button>
        </ProjectRoleGuard>
      </Stack>
    </Toolbar>
  );
};
