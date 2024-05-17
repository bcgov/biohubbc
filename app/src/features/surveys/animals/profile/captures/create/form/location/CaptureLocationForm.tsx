import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { useFormikContext } from 'formik';
import { ICreateEditCaptureRequest } from 'interfaces/useCritterApi.interface';
import CaptureLocationMapControl from './CaptureLocationMapControl';

/**
 * Returns the control for capture location on the animal capture form, wrapping around the actual map control.
 *
 * @returns
 */
const CaptureLocationForm = () => {
  const formikProps = useFormikContext<ICreateEditCaptureRequest>();

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
