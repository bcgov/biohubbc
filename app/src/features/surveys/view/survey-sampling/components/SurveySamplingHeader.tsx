import { mdiCog } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { ProjectRoleGuard } from 'components/security/Guards';
import { SURVEY_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { Link as RouterLink } from 'react-router-dom';

export const SurveySamplingHeader = () => {
  return (
    <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
      <Typography variant="h2" flex="1 1 auto">
        Sampling Information
      </Typography>
      <Stack gap={1} direction="row">
        <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SAMPLING_INFORMATION} />
        <ProjectRoleGuard
          validProjectPermissions={[SURVEY_PERMISSION.COORDINATOR, SURVEY_PERMISSION.COLLABORATOR]}
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
