import Grid from '@mui/material/Grid';
import Box from '@mui/system/Box';
import { useFormikContext } from 'formik';
import { ICreateEditMortalityRequest } from 'interfaces/useCritterApi.interface';
import { MortalityLocationMapControl } from './MortalityLocationMapControl';

export const MortalityLocationForm = () => {
  const formikProps = useFormikContext<ICreateEditMortalityRequest>();

  return (
    <Box component="fieldset">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MortalityLocationMapControl
            mapId="location_map"
            title="Mortality Location"
            name="mortality.location"
            formikProps={formikProps}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
