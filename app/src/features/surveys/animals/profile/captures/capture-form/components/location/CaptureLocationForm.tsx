import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { CaptureLocationMapControl } from './CaptureLocationMapControl';

/**
 * Returns the control for capture location on the animal capture form, wrapping around the actual map control.
 *
 * @return {*}
 */
export const CaptureLocationForm = () => {
  return (
    <Box component="fieldset">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CaptureLocationMapControl
            mapId="capture_location_map"
            title="Capture Location"
            name="capture.capture_location"
          />
        </Grid>
      </Grid>
    </Box>
  );
};
