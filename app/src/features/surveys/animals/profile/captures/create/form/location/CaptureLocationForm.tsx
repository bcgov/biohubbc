import Grid from '@mui/material/Grid';
import Box from '@mui/system/Box';
import { useFormikContext } from 'formik';
import { ICreateCaptureRequest } from 'interfaces/useCritterApi.interface';
import CaptureLocationMapControl from './CaptureLocationMapControl';

const CaptureLocationForm = () => {
  const formikProps = useFormikContext<ICreateCaptureRequest>();

  return (
    <Box component="fieldset">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CaptureLocationMapControl
            mapId="capture_location_map"
            title="Capture Location"
            name="capture.capture_location"
            formikProps={formikProps}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default CaptureLocationForm;
