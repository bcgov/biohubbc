import Grid from '@mui/material/Grid';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import yup from 'utils/YupSchema';

export const DeviceDetailsFormInitialValues: yup.InferType<typeof DeviceDetailsFormYupSchema> = {
  serial: null as unknown as string,
  device_make_id: null as unknown as number,
  model: null,
  comment: null
};

export const DeviceDetailsFormYupSchema = yup.object({
  serial: yup.string().required('You must enter the device serial number'),
  device_make_id: yup.number().required('You must enter the device make'),
  model: yup.string().nullable().default(null),
  comment: yup.string().nullable().default(null)
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
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AutocompleteField name="device_make" id="device_make" label="Make" options={deviceMakes} required={true} />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField name="device_model" label="Model (optional)" maxLength={200} />
        </Grid>
      </Grid>
    </>
  );
};
