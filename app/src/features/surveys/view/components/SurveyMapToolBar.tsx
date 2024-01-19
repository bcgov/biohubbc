import { Box, Menu, MenuItem, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
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
          <ToggleButtonGroup value={dataset} onChange={updateDataSet} exclusive>
            <ToggleButton value={SurveySpatialDataSet.OBSERVATIONS}>Observations</ToggleButton>
            <ToggleButton value={SurveySpatialDataSet.TELEMETRY}>Telemetry</ToggleButton>
            <ToggleButton value={SurveySpatialDataSet.MARKED_ANIMALS}>Marked Animals</ToggleButton>
          </ToggleButtonGroup>
          <ToggleButtonGroup value={layout} onChange={updateLayout} exclusive>
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
