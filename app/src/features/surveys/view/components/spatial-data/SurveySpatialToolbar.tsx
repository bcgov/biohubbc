import { mdiBroadcast, mdiChevronDown, mdiCog, mdiEye } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export enum SurveySpatialDatasetViewEnum {
  OBSERVATIONS = 'OBSERVATIONS',
  TELEMETRY = 'TELEMETRY',
  MARKED_ANIMALS = 'MARKED_ANIMALS'
}

interface ISurveySpatialDatasetView {
  label: string;
  icon: string;
  value: SurveySpatialDatasetViewEnum;
  isLoading: boolean;
}

interface ISurveySptialToolbarProps {
  updateDatasetView: (view: SurveySpatialDatasetViewEnum) => void;
  views: ISurveySpatialDatasetView[];
  activeView: SurveySpatialDatasetViewEnum;
}

const SurveySpatialToolbar = (props: ISurveySptialToolbarProps) => {
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const updateDatasetView = (_event: React.MouseEvent<HTMLElement>, view: SurveySpatialDatasetViewEnum) => {
    if (!view) {
      return;
    }

    props.updateDatasetView(view);
  };

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
            <Icon path={mdiEye} size={1} />
          </ListItemIcon>
          <ListItemText>Observations</ListItemText>
        </MenuItem>
        <MenuItem component={RouterLink} to="telemetry">
          <ListItemIcon>
            <Icon path={mdiBroadcast} size={1} />
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
          <Typography variant="h3" flex="1 1 auto">
            Survey Data
          </Typography>
          <Button
            variant="contained"
            color="primary"
            aria-label="Manage Survey Data"
            onClick={handleMenuClick}
            startIcon={<Icon path={mdiCog} size={0.75}></Icon>}
            endIcon={<Icon path={mdiChevronDown} size={0.75}></Icon>}
            sx={{
              m: -1
            }}>
            Manage
          </Button>
        </Toolbar>
        <Divider flexItem></Divider>
        <Box p={2}>
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

export default SurveySpatialToolbar;