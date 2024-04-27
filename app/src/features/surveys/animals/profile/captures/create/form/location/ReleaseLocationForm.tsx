import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Box from '@mui/system/Box';
import { useFormikContext } from 'formik';
import { ICreateCaptureRequest } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import CaptureLocationMapControl from './CaptureLocationMapControl';

const ReleaseLocationForm = () => {
  const formikProps = useFormikContext<ICreateCaptureRequest>();
  const [isChecked, setIsChecked] = useState<boolean>(true);

  return (
    <>
      <FormControl required={true} component="fieldset">
        <FormControlLabel
          sx={{
            '& .MuiTypography-root': {
              fontWeight: 700
            }
          }}
          control={
            <Checkbox
              checked={isChecked}
              onChange={() => {
                setIsChecked(!isChecked);
              }}
              color="primary"
            />
          }
          label="The animal was released where it was captured"
        />
      </FormControl>

      {!isChecked && (
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
