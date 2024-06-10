import { mdiCog } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ProjectRoleGuard } from 'components/security/Guards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { Link as RouterLink } from 'react-router-dom';

export enum SurveySamplingViewEnum {
  TECHNIQUES = 'TECHNIQUES',
  SITES = 'SITES'
}

interface ISurveySamplingView {
  label: string;
  icon: string;
  value: SurveySamplingViewEnum;
  isLoading: boolean;
}

interface ISurveySamplingToolbarProps {
  updateDatasetView: (view: SurveySamplingViewEnum) => void;
  views: ISurveySamplingView[];
  activeView: SurveySamplingViewEnum;
}

const SurveySamplingToolbar = (props: ISurveySamplingToolbarProps) => {
  const updateDatasetView = (_event: React.MouseEvent<HTMLElement>, view: SurveySamplingViewEnum) => {
    if (!view) {
      return;
    }

    props.updateDatasetView(view);
  };

  return (
    <>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Typography variant="h2" flex="1 1 auto">
            Sampling Information
          </Typography>
          <ProjectRoleGuard
            validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button
              component={RouterLink}
              variant="contained"
              color="primary"
              aria-label="Manage Survey Data"
              to="manage-sampling"
              startIcon={<Icon path={mdiCog} size={0.75}></Icon>}
              sx={{
                my: -1
              }}>
              Manage
            </Button>
          </ProjectRoleGuard>
        </Toolbar>
        <Divider flexItem></Divider>
        <Box p={2} display="flex" justifyContent="space-between">
          <ToggleButtonGroup
            value={props.activeView}
            onChange={updateDatasetView}
            exclusive
            sx={{
              display: 'flex',
              gap: 1,
              '& Button': {
                py: 0.25,
                px: 1.5,
                border: 'none',
                borderRadius: '4px !important',
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.02rem'
              }
            }}>
            {props.views.map((view) => (
              <ToggleButton
                key={view.value}
                component={Button}
                color="primary"
                startIcon={<Icon path={view.icon} size={0.75} />}
                value={view.value}>
                {view.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>
    </>
  );
};

export default SurveySamplingToolbar;
