import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { AttachmentType } from 'constants/attachments';
import { ICreateAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import TelemetryFileUpload from 'features/surveys/view/survey-animals/telemetry-device/TelemetryFileUpload';
import { useFormikContext } from 'formik';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';

export const DeviceDetailsInitialValues = {
  survey_details: {
    survey_name: '',
    start_date: '',
    end_date: '',
    progress_id: null,
    survey_types: [],
    revision_count: 0
  },
  species: {
    focal_species: [],
    ancillary_species: []
  },
  permit: {
    permits: []
  }
};

export const DeviceDetailsYupSchema = () => yup.object();

interface IDeviceDetailsFormProps {
  deviceMakes: { label: string; value: string }[];
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const DeviceDetailsForm = (props: IDeviceDetailsFormProps) => {
  const { values } = useFormikContext<ICreateAnimalDeployment>();
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AutocompleteField
            name="device_make"
            id="device_make"
            label="Make"
            options={props.deviceMakes}
            required={true}
          />
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

export default DeviceDetailsForm;
