import { mdiBroadcast, mdiChevronDown, mdiEye } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Divider, ListItemIcon, ListItemText, Menu, MenuItem, ToggleButton, ToggleButtonGroup, Toolbar, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { useState } from 'react';

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

interface ISurveyMapToolBarProps {
  //TODO: I don't want to pull the contexts into this but I will need an array of key value pairs for the options
  updateDataSet: (data: SurveySpatialDataSet) => void;
  updateLayout: (data: SurveySpatialDataLayout) => void;
}
const SurveyMapToolBar = (props: ISurveyMapToolBarProps) => {
  const [dataset, setDataset] = useState<SurveySpatialDataSet>(SurveySpatialDataSet.OBSERVATIONS);
  const [layout, setLayout] = useState<SurveySpatialDataLayout>(SurveySpatialDataLayout.MAP);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const updateDataSet = (event: React.MouseEvent<HTMLElement>, newAlignment: SurveySpatialDataSet) => {
    setDataset(newAlignment);
    props.updateDataSet(newAlignment);
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
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem>
          <ListItemIcon><Icon path={mdiEye} size={1} /></ListItemIcon>
          <ListItemText>Observations</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon><Icon path={mdiBroadcast} size={1} /></ListItemIcon>
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
            endIcon={
              <Icon path={mdiChevronDown} size={0.75}></Icon>
            }
            sx={{
              m: -1
            }}
          >
            Manage
          </Button>
        </Toolbar>
        <Divider flexItem></Divider>
        <Box py={2} px={3}>
          <ToggleButtonGroup value={dataset} onChange={updateDataSet} exclusive
            sx={{
              display: 'flex',
              gap: 1,
              '& Button': {
                py: 0.25,
                px: 1.25,
                border: 'none',
                borderRadius: '4px !important',
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.02rem'
              }
            }}
          >
            <ToggleButton component={Button} color="primary" startIcon={<Icon path={mdiEye} size={0.75} />} value={SurveySpatialDataSet.OBSERVATIONS}>Observations</ToggleButton>
            <ToggleButton component={Button} color="primary" startIcon={<Icon path={mdiBroadcast} size={0.75} />} value={SurveySpatialDataSet.TELEMETRY}>Telemetry</ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup value={layout} onChange={updateLayout} exclusive sx={{display: 'none'}}>
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
