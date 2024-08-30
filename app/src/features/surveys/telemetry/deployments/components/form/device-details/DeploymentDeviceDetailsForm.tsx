import Grid from '@mui/material/Grid';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import yup from 'utils/YupSchema';

export const DeploymentDeviceDetailsFormInitialValues: yup.InferType<typeof DeploymentDeviceDetailsFormYupSchema> = {
  device_make: null as unknown as number,
  device_model: null
};

export const DeploymentDeviceDetailsFormYupSchema = yup.object({
  device_make: yup.number().nullable().required('You must enter the device make'),
  device_model: yup.string().nullable()
});

interface IDeploymentDeviceDetailsFormProps {
  deviceMakes: IAutocompleteFieldOption<number>[];
}

/**
 * Deployment form - device details section.
 *
 * @param {IDeploymentDeviceDetailsFormProps} props
 * @return {*}
 */
export const DeploymentDeviceDetailsForm = (props: IDeploymentDeviceDetailsFormProps) => {
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
