import { Checkbox, FormControlLabel, Grid, Stack } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { useFormikContext } from 'formik';
import { Fragment } from 'react';
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

  const { handleBlur, values, handleChange } = useFormikContext<IAnimal>();

  const showReleaseSection = values.captures[index].show_release;

  const value = values.captures[index];

  const renderCaptureFields = (): JSX.Element => {
    return (
      <Stack gap={3} key={'capture-fields'}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4}>
            <SingleDateField
              name={getAnimalFieldName<IAnimalCapture>(name, 'capture_timestamp', index)}
              required={true}
              label={'Capture Date'}
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <CustomTextField
              other={{ multiline: true, minRows: 2, required: isRequiredInSchema(AnimalCaptureSchema, 'capture_comment') }}
              label="Comments"
              name={getAnimalFieldName<IAnimalCapture>(name, 'capture_comment', index)}
              handleBlur={handleBlur}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              sx={{my: -1, ml: 0}}
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
        </Grid>
      </Stack>
    );
  };

  const renderReleaseFields = (): JSX.Element => {
    return (
      <Fragment key={`capture-release-fields`}>
        <Grid item xs={12} sm={6}>
          <SingleDateField
            name={getAnimalFieldName<IAnimalCapture>(name, 'release_timestamp', index)}
            label={'Release Date'}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            other={{ multiline: true, minRows: 2, required: isRequiredInSchema(AnimalCaptureSchema, 'release_comment') }}
            label="Comments"
            name={getAnimalFieldName<IAnimalCapture>(name, 'release_comment', index)}
            handleBlur={handleBlur}
          />
        </Grid>
      </Fragment>
    );
  };

  return (
    <LocationEntryForm
      name={name}
      index={index}
      value={value}
      primaryLocationFields={{
        latitude: 'capture_latitude',
        longitude: 'capture_longitude',
        coordinate_uncertainty: 'capture_coordinate_uncertainty',
        utm_northing: 'capture_utm_northing',
        utm_easting: 'capture_utm_easting'
      }}
      secondaryLocationFields={
        showReleaseSection
          ? {
              latitude: 'release_latitude',
              longitude: 'release_longitude',
              coordinate_uncertainty: 'release_coordinate_uncertainty',
              utm_northing: 'release_utm_northing',
              utm_easting: 'release_utm_easting'
            }
          : undefined
      }
      otherPrimaryFields={[renderCaptureFields()]}
      otherSecondaryFields={[renderReleaseFields()]}
    />
  );
};

export default CaptureAnimalFormContent;
