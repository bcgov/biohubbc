import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { AttachmentType } from 'constants/attachments';
import { ICreateAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import TelemetryFileUpload from 'features/surveys/view/survey-animals/telemetry-device/TelemetryFileUpload';
import { useFormikContext } from 'formik';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';

export const DeploymentDeviceDetailsFormInitialValues: yup.InferType<typeof DeploymentDeviceDetailsFormYupSchema> = {
  device_make: null as unknown as string,
  device_model: null
};

export const DeploymentDeviceDetailsFormYupSchema = yup.object({
  device_make: yup.string().nullable().required('You must enter the device make'),
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

  const { values } = useFormikContext<ICreateAnimalDeployment>();

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AutocompleteField name="device_make" id="device_make" label="Make" options={deviceMakes} required={true} />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField name="device_model" label="Model (optional)" maxLength={200} />
        </Grid>
        <Grid item xs={12} mt={3}>
          <TransitionGroup>
            {/* Only display device key component if the device make is for Vectronic or Lotek */}
            {['VECTRONIC', 'LOTEK'].includes(values.device_make) && (
              <Collapse>
                <Typography component="legend">Device key (optional)</Typography>
                <Typography color="textSecondary" mb={3}>
                  Device keys allow telemetry data from Vectronic and Lotek devices to be automatically loaded into your
                  Survey. Vectronic device keys are .keyx files. Lotek device keys are .cfg files. Telemetry data from
                  other manufacturers must be imported manually.
                </Typography>
                <TelemetryFileUpload
                  attachmentType={AttachmentType.KEYX}
                  fileKey="attachmentFile"
                  typeKey="attachmentType"
                />
              </Collapse>
            )}
          </TransitionGroup>
        </Grid>
      </Grid>
    </>
  );
};
