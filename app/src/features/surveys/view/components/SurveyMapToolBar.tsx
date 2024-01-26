import { mdiBroadcast, mdiChevronDown, mdiCog, mdiEye } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export enum SurveySpatialDataSet {
  OBSERVATIONS = 'Observations',
  TELEMETRY = 'Telemetry',
  MARKED_ANIMALS = 'Marked Animals'
}

export enum SurveySpatialDataLayout {
  MAP = 'Map',
  TABLE = 'Table',
  SPLIT = 'Split'
}

interface IToolBarButtons {
  label: string;
  icon: string;
  value: SurveySpatialDataSet;
  isLoading: boolean;
}
interface ISurveyMapToolBarProps {
  updateDataSet: (data: SurveySpatialDataSet) => void;
  updateLayout: (data: SurveySpatialDataLayout) => void;
  toggleButtons: IToolBarButtons[];
  currentTab: SurveySpatialDataSet;
}
const SurveyMapToolBar = (props: ISurveyMapToolBarProps) => {
  const [layout, setLayout] = useState<SurveySpatialDataLayout>(SurveySpatialDataLayout.MAP);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const updateDataSet = (event: React.MouseEvent<HTMLElement>, dataset: SurveySpatialDataSet) => {
    if (!dataset) {
      return;
    }

    props.updateDataSet(dataset);
  };

  const updateLayout = (event: React.MouseEvent<HTMLElement>, newAlignment: SurveySpatialDataLayout) => {
    setLayout(newAlignment);
    props.updateLayout(newAlignment);
  };

  const handleMenuClick = (e: any) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
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
            value={props.currentTab}
            onChange={updateDataSet}
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
            {props.toggleButtons.map((item) => (
              <ToggleButton
                key={item.value}
                component={Button}
                color="primary"
                startIcon={<Icon path={item.icon} size={0.75} />}
                value={item.value}>
                {item.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <ToggleButtonGroup value={layout} onChange={updateLayout} exclusive sx={{ display: 'none' }}>
            <ToggleButton value={SurveySpatialDataLayout.MAP}>MAP</ToggleButton>
            <ToggleButton value={SurveySpatialDataLayout.TABLE}>TABLE</ToggleButton>
            <ToggleButton value={SurveySpatialDataLayout.SPLIT}>SPLIT</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </>
  );
};

export default SurveyMapToolBar;
