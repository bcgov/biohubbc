import { Box, Menu, MenuItem, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { useState } from 'react';

export enum SurveyMapDataSet {
  OBSERVATIONS = 'Observations',
  TELEMETRY = 'Telemetry',
  MARKED_ANIMALS = 'Marked Animals'
}

export enum SurveyMapDataDisplay {
  MAP = 'Map',
  TABLE = 'Table',
  SPLIT = 'Split'
}

const SurveyMapToolBar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const updateDataSet = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    console.log(`DataSet: ${newAlignment}`);
  };
  const updateLayout = (event: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
    console.log(`Layout: ${newAlignment}`);
  };

  const handleMenuClick = (e: any) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
        <MenuItem>Observations</MenuItem>
        <MenuItem>Telemetry</MenuItem>
        <MenuItem>Marked Animals</MenuItem>
      </Menu>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
          <Typography variant="h1" component="h2">
            Survey Data
          </Typography>
          <Button variant="contained" color="primary" title="Manage Map" onClick={handleMenuClick}>
            Manage
          </Button>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
          <ToggleButtonGroup onChange={updateDataSet}>
            <ToggleButton value={SurveyMapDataSet.OBSERVATIONS}>Observations</ToggleButton>
            <ToggleButton value={SurveyMapDataSet.TELEMETRY}>Telemetry</ToggleButton>
            <ToggleButton value={SurveyMapDataSet.MARKED_ANIMALS}>Marked Animals</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup onChange={updateLayout}>
            <ToggleButton value={SurveyMapDataDisplay.MAP}>MAP</ToggleButton>
            <ToggleButton value={SurveyMapDataDisplay.TABLE}>TABLE</ToggleButton>
            <ToggleButton value={SurveyMapDataDisplay.SPLIT}>SPLIT</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </>
  );
};

export default SurveyMapToolBar;
