import { Box, Checkbox, FormControlLabel, Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { useFormikContext } from 'formik';
import { AnimalCaptureSchema, getAnimalFieldName, IAnimal, IAnimalCapture, isRequiredInSchema } from '../animal';
import LocationEntryForm from './LocationEntryForm';

/**
 * Renders the Capture form inputs
 *
 * index of formik array item
 * @param {index}
 *
 * @return {*}
 *
 **/

interface CaptureAnimalFormContentProps {
  index: number;
}

export const CaptureAnimalFormContent = ({ index }: CaptureAnimalFormContentProps) => {
  const name: keyof IAnimal = 'captures';

  const { values, handleBlur, handleChange } = useFormikContext<IAnimal>();

  const showReleaseSection = values.captures[index].show_release;

  const value = values.captures[index];

  return (
    <>
      <Box component="fieldset">
        <Typography flexGrow={1} component="legend">
          Event Dates
        </Typography>
        <Grid container spacing={2} mb={3}>
          <Grid item md={6} lg={6} sm={6}>
            <SingleDateField
              name={getAnimalFieldName<IAnimalCapture>(name, 'capture_timestamp', index)}
              required={true}
              label={'Capture Date'}
            />
          </Grid>
          <Grid item sm={6} md={6} lg={6}>
            <SingleDateField
              name={getAnimalFieldName<IAnimalCapture>(name, 'release_timestamp', index)}
              label={'Release Date'}
            />
          </Grid>
        </Grid>
      </Box>
      <Box mb={3}>
        <LocationEntryForm
          name={name}
          index={index}
          value={value}
          primaryLocationFields={{
            fieldsetTitle: 'Capture Location',
            latitude: 'capture_latitude',
            longitude: 'capture_longitude',
            coordinate_uncertainty: 'capture_coordinate_uncertainty',
            utm_northing: 'capture_utm_northing',
            utm_easting: 'capture_utm_easting'
          }}
          secondaryLocationFields={
            showReleaseSection
              ? {
                  fieldsetTitle: 'Release Location',
                  latitude: 'release_latitude',
                  longitude: 'release_longitude',
                  coordinate_uncertainty: 'release_coordinate_uncertainty',
                  utm_northing: 'release_utm_northing',
                  utm_easting: 'release_utm_easting'
                }
              : undefined
          }
          otherPrimaryFields={[
            <Grid item xs={12}>
              <FormControlLabel
                sx={{ my: -1, ml: 0 }}
                control={
                  <Checkbox
                    onChange={handleChange}
                    checked={values.captures[index].show_release}
                    disabled={!!values.captures[index].release_location_id}
                    name={getAnimalFieldName<IAnimalCapture>(name, 'show_release', index)}
                  />
                }
                label={SurveyAnimalsI18N.animalCaptureReleaseRadio}
              />
            </Grid>
          ]}
          //otherSecondaryFields={[renderReleaseFields()]}
        />
      </Box>
      <Box component="fieldset">
        <Typography flexGrow={1} component="legend">
          Additional Information
        </Typography>
        <Grid container>
          <Grid item xs={12}>
            <CustomTextField
              other={{
                multiline: true,
                minRows: 2,
                required: isRequiredInSchema(AnimalCaptureSchema, 'capture_comment')
              }}
              label="Comments"
              name={getAnimalFieldName<IAnimalCapture>(name, 'capture_comment', index)}
              handleBlur={handleBlur}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default CaptureAnimalFormContent;
