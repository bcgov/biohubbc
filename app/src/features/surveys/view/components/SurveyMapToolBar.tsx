import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import Button from '@mui/material/Button';

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
  // const setCurrentDataSet = (dataset: SurveyMapDataSet) => {
  //   console.log(`Current Data Selected: ${dataset}`);
  // };
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          width: '100%'
        }}>
        <ToggleButtonGroup onChange={(e) => {}}>
          <ToggleButton value={SurveyMapDataSet.OBSERVATIONS}>Observations</ToggleButton>
          <ToggleButton value={SurveyMapDataSet.TELEMETRY}>Telemetry</ToggleButton>
          <ToggleButton value={SurveyMapDataSet.MARKED_ANIMALS}>Marked Animals</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup>
          <ToggleButton value={SurveyMapDataDisplay.MAP}>MAP</ToggleButton>
          <ToggleButton value={SurveyMapDataDisplay.TABLE}>TABLE</ToggleButton>
          <ToggleButton value={SurveyMapDataDisplay.SPLIT}>SPLIT</ToggleButton>
        </ToggleButtonGroup>
        <Button variant="contained" color="primary" title="Manage Map">
          Manage
        </Button>
      </Box>
    </>
  );
};

export default SurveyMapToolBar;
