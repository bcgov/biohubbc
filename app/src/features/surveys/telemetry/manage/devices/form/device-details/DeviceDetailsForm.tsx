import Grid from '@mui/material/Grid';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import yup from 'utils/YupSchema';

export const DeviceDetailsFormInitialValues: yup.InferType<typeof DeviceDetailsFormYupSchema> = {
  device_make_id: null as unknown as number,
  serial: null as unknown as string,
  model: null,
  comment: null
};

export const DeviceDetailsFormYupSchema = yup.object({
  device_make_id: yup.number().nullable().required('You must enter the device make'),
  serial: yup.string().nullable().required('You must enter the device serial number'),
  model: yup.string().max(100, 'Cannot exceed 100 characters').nullable().default(null),
  comment: yup.string().max(250, 'Cannot exceed 250 characters').nullable().default(null)
});

interface IDeviceDetailsFormProps {
  deviceMakes: IAutocompleteFieldOption<number>[];
}

/**
 * Device form - details section.
 *
 * @param {IDeviceDetailsFormProps} props
 * @return {*}
 */
export const DeviceDetailsForm = (props: IDeviceDetailsFormProps) => {
  const { deviceMakes } = props;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <AutocompleteField
          name="device_make_id"
          id="device_make_id"
          label="Make"
          helpText='Indicate the vendor from which the device was purchased.'
          options={deviceMakes}
          required={true}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField name="serial" label="Serial Number" maxLength={100} other={{ required: true }} 
        helpText='Commonly referred to as the device identifer.'/>
      </Grid>
      <Grid item xs={12}>
        <CustomTextField name="model" label="Model (optional)" maxLength={100} />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name="comment"
          label="Comments (optional)"
          maxLength={250}
          other={{ multiline: true, rows: 4 }}
        />
      </Grid>
    </Grid>
  );
};
