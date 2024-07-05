import { Radio, Typography } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import RadioGroup from '@mui/material/RadioGroup';
import Box from '@mui/system/Box';
import booleanEqual from '@turf/boolean-equal';
import { useFormikContext } from 'formik';
import { ICreateCaptureRequest, IEditCaptureRequest } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import { CaptureLocationMapControl } from './CaptureLocationMapControl';

/**
 * Returns the control for release location on the animal capture form, wrapping around the actual map control.
 *
 * @return {*}
 */
export const ReleaseLocationForm = <FormikValuesType extends ICreateCaptureRequest | IEditCaptureRequest>() => {
  const { values, setFieldValue } = useFormikContext<FormikValuesType>();

  // Determine if the release location is the same as the capture location
  // If the release location is the same as the capture location, we don't need to show the release location map control
  const [isReleaseSameAsCapture, setIsReleaseSameAsCapture] = useState<boolean>(
    !(values.capture.release_location && values.capture.capture_location) ||
      booleanEqual(values.capture.release_location, values.capture.capture_location)
  );

  return (
    <>
      <Typography component="legend" variant="h5" mb={1}>
        Was the animal released where it was captured?
      </Typography>
      <RadioGroup
        aria-label="release-location"
        value={isReleaseSameAsCapture}
        onChange={(event) => {
          if (event.target.value) {
            // Clear the release location if it is the same as the capture location
            setFieldValue('capture.release_location', null);
          }
          setIsReleaseSameAsCapture(event.target.value === 'true');
        }}>
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
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </>
  );
};
