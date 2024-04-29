import Grid from '@mui/material/Grid';
import Box from '@mui/system/Box';
import { useFormikContext } from 'formik';
import { ICreateMortalityRequest } from 'interfaces/useCritterApi.interface';
import MortalityLocationMapControl from './MortalityLocationMapControl';

const MortalityLocationForm = () => {
  const formikProps = useFormikContext<ICreateMortalityRequest>();

  return (
    <Box component="fieldset">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MortalityLocationMapControl
            mapId="mortality_location_map"
            title="Mortality Location"
            name="mortality_location"
            formikProps={formikProps}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default MortalityLocationForm;
