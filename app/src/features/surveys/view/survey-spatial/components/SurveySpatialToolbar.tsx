import { mdiChevronDown, mdiCog, mdiEye, mdiPaw, mdiWifiMarker } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { ProjectRoleGuard } from 'components/security/Guards';
import CustomToggleButtonGroup, { ToggleButtonView } from 'components/toolbar/CustomToggleButtonGroup';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export enum SurveySpatialDatasetViewEnum {
  OBSERVATIONS = 'OBSERVATIONS',
  TELEMETRY = 'TELEMETRY',
  ANIMALS = 'ANIMALS'
}

interface ISurveySpatialToolbarProps {
  activeView: SurveySpatialDatasetViewEnum;
  setActiveView: (view: SurveySpatialDatasetViewEnum) => void;
  views: ToggleButtonView<SurveySpatialDatasetViewEnum>[];
}

/**
 * Toolbar that buttons (tabs) to switch between different views of the survey data (observations, animals, telemetry).
 *
 * @param {ISurveySpatialToolbarProps} props
 * @return {*}
 */
export const SurveySpatialToolbar = (props: ISurveySpatialToolbarProps) => {
  const { activeView, setActiveView, views } = props;

  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        disableAutoFocusItem
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        sx={{
          mt: 1,
          '& a': {
            display: 'flex',
            px: 2,
            py: '6px',
            textDecoration: 'none',
            color: 'text.primary',
            borderRadius: 0,
            '&:focus': {
              outline: 'none'
            }
          }
        }}>
        <MenuItem component={RouterLink} to="observations">
          <ListItemIcon>
            <Icon path={mdiEye} size={0.8} />
          </ListItemIcon>
          <ListItemText>Observations</ListItemText>
        </MenuItem>
        <MenuItem component={RouterLink} to="animals">
          <ListItemIcon>
            <Icon path={mdiPaw} size={0.8} />
          </ListItemIcon>
          <ListItemText>Animals</ListItemText>
        </MenuItem>
        <MenuItem component={RouterLink} to="telemetry">
          <ListItemIcon>
            <Icon path={mdiWifiMarker} size={0.8} />
          </ListItemIcon>
          <ListItemText>Telemetry</ListItemText>
        </MenuItem>
      </Menu>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
        <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Typography variant="h2" flex="1 1 auto">
            Survey Data
          </Typography>
          <Stack gap={1} direction="row">
            <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SURVEY_DATA} />
            <ProjectRoleGuard
              validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <Button
                variant="contained"
                color="primary"
                aria-label="Manage Survey Data"
                onClick={handleMenuClick}
                startIcon={<Icon path={mdiCog} size={0.75}></Icon>}
                endIcon={<Icon path={mdiChevronDown} size={0.75}></Icon>}>
                Manage
              </Button>
            </ProjectRoleGuard>
          </Stack>
        </Toolbar>
        <Divider flexItem></Divider>
        <Box p={2} display="flex" justifyContent="space-between">
          <CustomToggleButtonGroup
            views={views}
            activeView={activeView}
            onViewChange={(view) => setActiveView(view)}
            orientation="horizontal"
          />
        </Box>
      </Box>
    </>
  );
};
