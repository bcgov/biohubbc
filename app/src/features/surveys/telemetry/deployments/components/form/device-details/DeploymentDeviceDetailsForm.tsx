import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { AttachmentType, AttachmentTypeFileExtensions } from 'constants/attachments';
import { DeploymentDeviceKeyField } from 'features/surveys/telemetry/deployments/components/form/device-details/DeploymentDeviceKeyField';
import { ICreateAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { useFormikContext } from 'formik';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';

const KEYX_DEVICES = ['VECTRONIC'];
const CFG_DEVICES = ['LOTEK'];

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

  const { values } = useFormikContext<ICreateAnimalDeployment>();

  // The human readable name of the device make selected in the form
  const selectedDeviceMakeName = deviceMakes.find((option) => option.value === values.device_make)?.label ?? '';

  const getAttachmentType = (deviceMakeName: string): AttachmentType | null => {
    if (KEYX_DEVICES.includes(deviceMakeName)) {
      return AttachmentType.KEYX;
    }

    if (CFG_DEVICES.includes(deviceMakeName)) {
      return AttachmentType.CFG;
    }

    return null;
  };

  const attachmentType = getAttachmentType(selectedDeviceMakeName);

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
            {attachmentType === AttachmentType.KEYX ? (
              <Collapse>
                <Typography component="legend">Device key (optional)</Typography>
                <Typography color="textSecondary" mb={3}>
                  Device keys allow telemetry data from Vectronic to be automatically loaded into your Survey. Vectronic
                  device keys are .keyx files. Telemetry data from other manufacturers must be imported manually.
                </Typography>
                <DeploymentDeviceKeyField
                  attachmentType={attachmentType}
                  attachmentTypeFileExtensions={AttachmentTypeFileExtensions.KEYX}
                  fileKey="attachmentFile"
                  typeKey="attachmentType"
                />
              </Collapse>
            ) : null}
            {attachmentType === AttachmentType.CFG ? (
              <Collapse>
                <Typography component="legend">Device key (optional)</Typography>
                <Typography color="textSecondary" mb={3}>
                  Device keys allow telemetry data from Lotek devices to be automatically loaded into your Survey. Lotek
                  device keys are .cfg files. Telemetry data from other manufacturers must be imported manually.
                </Typography>
                <DeploymentDeviceKeyField
                  attachmentType={attachmentType}
                  attachmentTypeFileExtensions={AttachmentTypeFileExtensions.CFG}
                  fileKey="attachmentFile"
                  typeKey="attachmentType"
                />
              </Collapse>
            ) : null}
          </TransitionGroup>
        </Grid>
      </Grid>
    </>
  );
};
