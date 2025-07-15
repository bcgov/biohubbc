import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { AnimalAutocompleteField } from 'components/fields/AnimalAutocompleteField';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { DeviceAutocompleteField } from 'components/fields/DeviceAutocompleteField';
import { useFormikContext } from 'formik';
import { ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { ICreateAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
import { TelemetryDevice } from 'interfaces/useTelemetryDeviceApi.interface';
import get from 'lodash-es/get';
import { numberOrNull } from 'utils/string-utils';
import { isDefined } from 'utils/Utils';
import yup from 'utils/YupSchema';

export const DeploymentDetailsFormInitialValues: yup.InferType<typeof DeploymentDetailsFormYupSchema> = {
  device_id: null as unknown as number,
  critter_id: null as unknown as number,
  frequency: null as unknown as number,
  frequency_unit_id: null as unknown as number
};

export const DeploymentDetailsFormYupSchema = yup.object({
  device_id: yup.number().nullable().required('You must enter the device ID. This is typically the serial number'),
  critter_id: yup.number().nullable().required('You must select the animal that the device is associated to'),
  frequency: yup.lazy(() =>
    yup
      .number()
      .nullable()
      .default(null)
      .when('frequency_unit_id', {
        is: (frequency_unit_id: number) => isDefined(frequency_unit_id), // when frequency_unit_id is defined
        then: yup.number().nullable().default(null).required('Frequency is required')
      })
  ),
  frequency_unit_id: yup.lazy(() =>
    yup
      .number()
      .nullable()
      .default(null)
      .when('frequency', {
        is: (frequency: number) => isDefined(frequency), // when frequency is defined
        then: yup.number().nullable().default(null).required('Frequency unit is required')
      })
  )
});

interface IDeploymentDetailsFormProps {
  surveyAnimals: ICritterSimpleResponse[];
  surveyDevices: TelemetryDevice[];
  frequencyUnits: IAutocompleteFieldOption<number>[];
}

/**
 * Deployment form - deployment details section.
 *
 * @param {IDeploymentDetailsFormProps} props
 * @return {*}
 */
export const DeploymentDetailsForm = (props: IDeploymentDetailsFormProps) => {
  const { surveyAnimals, surveyDevices, frequencyUnits } = props;

  const { setFieldValue, values, touched, errors, handleBlur } = useFormikContext<ICreateAnimalDeployment>();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <DeviceAutocompleteField
          formikFieldName="device_id"
          label="Device"
          options={surveyDevices}
          defaultDevice={surveyDevices.find((device) => device.device_id === values.device_id)}
          required
          clearOnSelect
          onSelect={(device: TelemetryDevice) => {
            if (device) {
              setFieldValue('device_id', device.device_id);
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <AnimalAutocompleteField
          formikFieldName="critter_id"
          label="Animal"
          defaultAnimal={surveyAnimals.find((animal) => animal.critter_id === values.critter_id)}
          required
          clearOnSelect
          onSelect={(animal: ICritterSimpleResponse) => {
            if (animal) {
              setFieldValue('critter_id', animal.critter_id);
              setFieldValue('critterbase_start_capture_id', null);
              setFieldValue('attachment_start_date', null);
              setFieldValue('attachment_start_time', null);
              setFieldValue('attachment_end_date', null);
              setFieldValue('attachment_end_time', null);
              setFieldValue('critterbase_end_capture_id', null);
              setFieldValue('critterbase_end_mortality_id', null);
            }
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" flex={1}>
          <TextField
            name="frequency"
            label="Device frequency"
            type="number"
            inputProps={{
              'data-testid': 'frequency',
              step: 'any' // Allows any decimal number
            }}
            onChange={(event) => {
              // Parse decimal value or return null if input is empty
              setFieldValue('frequency', numberOrNull(event.target.value));
            }}
            onBlur={handleBlur}
            variant="outlined"
            value={get(values, 'frequency') ?? ''}
            error={get(touched, 'frequency') && Boolean(get(errors, 'frequency'))}
            helperText={get(touched, 'frequency') && get(errors, 'frequency')}
            sx={{
              flex: 0.8,
              '& .MuiOutlinedInput-root': {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0
              }
            }}
          />

          <AutocompleteField
            name="frequency_unit_id"
            id="frequency_unit_id"
            label={'Unit'}
            options={frequencyUnits}
            required={!!(values.frequency || values.frequency_unit_id)}
            sx={{
              flex: 0.2,
              '& .MuiOutlinedInput-root': { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }
            }}
          />
        </Stack>
      </Grid>
    </Grid>
  );
};
