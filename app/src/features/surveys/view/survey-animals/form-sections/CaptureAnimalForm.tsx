import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { Field, useFormikContext } from 'formik';
import { useDialogContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';
import { useState } from 'react';
import { getLatLngAsUtm, getUtmAsLatLng, PROJECTION_MODE } from 'utils/mapProjectionHelpers';
import {
  AnimalFormProps,
  ANIMAL_FORM_MODE,
  CreateCritterCaptureSchema,
  ICreateCritterCapture,
  isRequiredInSchema
} from '../animal';
import FormLocationPreview from './LocationEntryForm';

/**
 * This component renders a 'critter capture' create / edit dialog.
 *
 * Ties into the LocationEntryForm to display capture / release details on map.
 * Handles additional conversion of UTM <--> WGS coordinates during edit and submission.
 *
 * @param {AnimalFormProps<ICaptureResponse>} props - Generic AnimalFormProps.
 * @returns {*}
 */
export const CaptureAnimalForm = (props: AnimalFormProps<ICaptureResponse>) => {
  const critterbaseApi = useCritterbaseApi();
  const dialog = useDialogContext();

  const [loading, setLoading] = useState(false);
  const [projectionMode, setProjectionMode] = useState(PROJECTION_MODE.WGS);

  const handleSave = async (values: ICreateCritterCapture) => {
    setLoading(true);
    try {
      if (projectionMode === PROJECTION_MODE.UTM) {
        if (values.release_location) {
          const [latitude, longitude] = getUtmAsLatLng(
            values.release_location.latitude,
            values.release_location.longitude
          );
          values = { ...values, release_location: { ...values.release_location, latitude, longitude } };
        }
        const [latitude, longitude] = getUtmAsLatLng(
          values.capture_location.latitude,
          values.capture_location.longitude
        );
        values = { ...values, capture_location: { ...values.capture_location, latitude, longitude } };
      }
      if (props.formMode === ANIMAL_FORM_MODE.ADD) {
        await critterbaseApi.capture.createCapture(values);
        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully created capture.` });
      }
      if (props.formMode === ANIMAL_FORM_MODE.EDIT) {
        await critterbaseApi.capture.updateCapture(values);
        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully edited capture.` });
      }
    } catch (err) {
      dialog.setSnackbar({ open: true, snackbarMessage: `Critter capture request failed.` });
    } finally {
      props.handleClose();
      setLoading(false);
    }
  };

  return (
    <EditDialog
      dialogTitle={props.formMode === ANIMAL_FORM_MODE.ADD ? 'Add Capture' : 'Edit Capture'}
      open={props.open}
      onCancel={props.handleClose}
      onSave={handleSave}
      size="md"
      debug
      dialogLoading={loading}
      component={{
        initialValues: {
          capture_id: props?.formObject?.capture_id,
          critter_id: props.critter.critter_id,
          capture_location: {
            location_id: props?.formObject?.capture_location.location_id,
            latitude: props?.formObject?.capture_location?.latitude ?? ('' as unknown as number),
            longitude: props?.formObject?.capture_location?.longitude ?? ('' as unknown as number),
            coordinate_uncertainty:
              props?.formObject?.capture_location?.coordinate_uncertainty ?? ('' as unknown as number),
            coordinate_uncertainty_unit: props?.formObject?.capture_location?.coordinate_uncertainty_unit ?? 'm'
          },
          release_location: props?.formObject?.release_location
            ? {
                location_id: props?.formObject?.release_location?.location_id,
                latitude: props?.formObject?.release_location?.latitude ?? undefined,
                longitude: props?.formObject?.release_location?.longitude ?? undefined,
                coordinate_uncertainty: props?.formObject?.release_location?.coordinate_uncertainty,
                coordinate_uncertainty_unit: props?.formObject?.release_location?.coordinate_uncertainty_unit ?? 'm'
              }
            : undefined,
          capture_timestamp: props?.formObject?.capture_timestamp as unknown as Date,
          release_timestamp: (props?.formObject?.release_timestamp as unknown as Date) ?? undefined,
          capture_comment: props?.formObject?.capture_comment ?? undefined,
          release_comment: props?.formObject?.release_comment ?? undefined
        },
        validationSchema: CreateCritterCaptureSchema,
        element: (
          <CaptureFormFields
            formMode={props.formMode}
            projectionMode={projectionMode}
            handleProjection={setProjectionMode}
          />
        )
      }}
    />
  );
};

type CaptureFormProps = Pick<AnimalFormProps<ICaptureResponse>, 'formMode'> & {
  projectionMode: PROJECTION_MODE;
  handleProjection: (projection: PROJECTION_MODE) => void;
};

const CaptureFormFields = (props: CaptureFormProps) => {
  const { values, setValues, setFieldValue } = useFormikContext<ICreateCritterCapture>();

  const [showRelease, setShowRelease] = useState(values.release_location);

  const isUtmProjection = props.projectionMode === PROJECTION_MODE.UTM;

  const disableUtmToggle =
    !values.capture_location.latitude ||
    !values.capture_location.longitude ||
    (showRelease && !values?.release_location?.latitude) ||
    !values?.release_location?.longitude;

  const handleShowRelease = () => {
    /**
     * If release is currently showing wipe existing values in release_location.
     *
     */
    if (showRelease) {
      setFieldValue('release_location', undefined);
      setShowRelease(false);
      return;
    }
    setValues({
      ...values,
      release_location: { latitude: '', longitude: '', coordinate_uncertainty: '', coordinate_uncertainty_unit: 'm' }
    });
    setShowRelease(true);
  };

  const handleProjectionChange = () => {
    const switchProjection = isUtmProjection ? PROJECTION_MODE.WGS : PROJECTION_MODE.UTM;

    /**
     * These projection conversions are expecting non null values for lat/lng.
     * UI currently hides the UTM toggle when these values are not defined in the form.
     *
     */
    const [captureLat, captureLon] = !isUtmProjection
      ? getLatLngAsUtm(values.capture_location.latitude, values.capture_location.longitude)
      : getUtmAsLatLng(values.capture_location.latitude, values.capture_location.longitude);

    const [releaseLat, releaseLon] = !isUtmProjection
      ? getLatLngAsUtm(values.release_location.latitude, values.release_location.longitude)
      : getUtmAsLatLng(values.release_location.latitude, values.release_location.longitude);

    setValues({
      ...values,
      capture_location: {
        ...values.capture_location,
        projection_mode: switchProjection,
        latitude: captureLat,
        longitude: captureLon
      },
      release_location: {
        ...values.release_location,
        projection_mode: switchProjection,
        latitude: releaseLat,
        longitude: releaseLon
      }
    });

    props.handleProjection(switchProjection);
  };

  return (
    <Stack gap={4}>
      <Box component="fieldset">
        <Box display="flex" justifyContent="space-between">
          <Typography component="legend">Event Dates</Typography>
          <FormControlLabel
            control={<Switch onChange={handleProjectionChange} disabled={disableUtmToggle} />}
            label="UTM"
          />
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <SingleDateField name={'capture_timestamp'} required={true} label={'Capture Date'} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SingleDateField name={'release_timestamp'} label={'Release Date'} />
          </Grid>
        </Grid>
      </Box>

      <Box component="fieldset">
        <Typography component="legend">Capture Location</Typography>
        <Grid container spacing={2}>
          <Grid item sm={4}>
            <Field
              as={CustomTextField}
              other={{ required: true, type: 'number' }}
              label={isUtmProjection ? 'Northing' : 'Latitude'}
              name={'capture_location.latitude'}
            />
          </Grid>
          <Grid item sm={4}>
            <CustomTextField
              other={{ required: true, type: 'number' }}
              label={isUtmProjection ? 'Easting' : 'Longitude'}
              name={'capture_location.longitude'}
            />
          </Grid>
          <Grid item sm={4}>
            <CustomTextField
              other={{
                required: true,
                type: 'number'
              }}
              label="Uncertainty (Meters)"
              name={'capture_location.coordinate_uncertainty'}
            />
          </Grid>
          {props.formMode === ANIMAL_FORM_MODE.ADD ? (
            <Grid item>
              <FormControlLabel
                control={<Checkbox size="small" onChange={handleShowRelease} checked={showRelease} />}
                label={SurveyAnimalsI18N.animalCaptureReleaseRadio}
              />
            </Grid>
          ) : null}
        </Grid>
      </Box>

      {showRelease ? (
        <Box key="release-location" component="fieldset" mb={0}>
          <Typography component="legend">Release Location</Typography>
          <Grid container spacing={2}>
            <Grid item sm={4}>
              <Field
                as={CustomTextField}
                other={{ required: true, type: 'number' }}
                label={isUtmProjection ? 'Northing' : 'Latitude'}
                name={'release_location.latitude'}
              />
            </Grid>
            <Grid item sm={4}>
              <CustomTextField
                other={{ required: true, type: 'number' }}
                label={isUtmProjection ? 'Easting' : 'Longitude'}
                name={'release_location.longitude'}
              />
            </Grid>
            <Grid item sm={4}>
              <CustomTextField
                other={{
                  required: true,
                  type: 'number'
                }}
                label="Uncertainty (Meters)"
                name={'release_location.coordinate_uncertainty'}
              />
            </Grid>
          </Grid>
        </Box>
      ) : null}

      <FormLocationPreview
        projection={props.projectionMode}
        locations={
          showRelease
            ? [
                {
                  title: 'Capture',
                  pingColour: 'blue',
                  fields: { latitude: 'capture_location.latitude', longitude: 'capture_location.longitude' }
                },
                {
                  title: 'Release',
                  pingColour: 'red',
                  fields: { latitude: 'release_location.latitude', longitude: 'release_location.longitude' }
                }
              ]
            : [
                {
                  title: 'Capture',
                  pingColour: 'blue',
                  fields: { latitude: 'capture_location.latitude', longitude: 'capture_location.longitude' }
                }
              ]
        }
      />
      <Box component="fieldset">
        <Typography component="legend">Additional Information</Typography>
        <CustomTextField
          other={{
            multiline: true,
            minRows: 2,
            required: isRequiredInSchema(CreateCritterCaptureSchema, 'capture_comment')
          }}
          label="Comments"
          name={'capture_comment'}
        />
      </Box>
    </Stack>
  );
};

export default CaptureAnimalForm;
