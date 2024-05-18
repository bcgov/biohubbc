import { Radio, Typography } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import RadioGroup from '@mui/material/RadioGroup';
import Box from '@mui/system/Box';
import { useFormikContext } from 'formik';
import { ICreateEditCaptureRequest } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import CaptureLocationMapControl from './CaptureLocationMapControl';

/**
 * Returns the control for release location on the animal capture form, wrapping around the actual map control.
 *
 * @returns
 */
const ReleaseLocationForm = () => {
  const formikProps = useFormikContext<ICreateEditCaptureRequest>();
  const [isReleaseSameAsCapture, setIsReleaseSameAsCapture] = useState<boolean>(true);

  return (
    <>
      <Typography component="legend" variant="h5" mb={1}>
        Was the animal released where it was captured?
      </Typography>
      <RadioGroup
        aria-label="release-location"
        value={isReleaseSameAsCapture} // assuming you have a state variable for the selected value
        onChange={() => setIsReleaseSameAsCapture(!isReleaseSameAsCapture)} // assuming you have a function to handle value change
      >
        <FormControlLabel value="true" control={<Radio color="primary" />} label="Yes" />
        <FormControlLabel value="false" control={<Radio color="primary" />} label="No" />
      </RadioGroup>

      {!isReleaseSameAsCapture && (
        <Box component="fieldset" mt={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CaptureLocationMapControl
                mapId="release_location_map"
                title="Release Location"
                name="capture.release_location"
                formikProps={formikProps}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
};

export default ReleaseLocationForm;
