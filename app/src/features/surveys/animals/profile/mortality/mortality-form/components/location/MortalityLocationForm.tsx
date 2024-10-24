import Grid from '@mui/material/Grid';
import Box from '@mui/system/Box';
import { MortalityLocationMapControl } from './MortalityLocationMapControl';

/**
 * Returns the form for entering the location of an animal mortality.
 *
 * @return {*}
 */
export const MortalityLocationForm = () => {
  return (
    <Box component="fieldset">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MortalityLocationMapControl mapId="location_map" title="Mortality Location" name="mortality.location" />
        </Grid>
      </Grid>
    </Box>
  );
};
