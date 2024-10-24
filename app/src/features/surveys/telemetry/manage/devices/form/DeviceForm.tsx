import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import {
  DeviceDetailsForm,
  DeviceDetailsFormInitialValues,
  DeviceDetailsFormYupSchema
} from 'features/surveys/telemetry/manage/devices/form/device-details/DeviceDetailsForm';
import { useFormikContext } from 'formik';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import { CreateTelemetryDevice } from 'interfaces/useTelemetryDeviceApi.interface';
import { useHistory } from 'react-router';

export const DeviceFormInitialValues = {
  ...DeviceDetailsFormInitialValues
};

export const DeviceFormYupSchema = DeviceDetailsFormYupSchema;

interface IDeviceFormProps {
  isSubmitting: boolean;
}

/**
 * Device form component.
 *
 * @param {IDeviceFormProps} props
 * @return {*}
 */
export const DeviceForm = (props: IDeviceFormProps) => {
  const { isSubmitting } = props;

  const { submitForm } = useFormikContext<CreateTelemetryDevice>();

  const codesContext = useCodesContext();
  const surveyContext = useSurveyContext();

  const history = useHistory();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <Stack gap={5}>
          <HorizontalSplitFormComponent title="Device Metadata" summary="Enter information about the device.">
            <DeviceDetailsForm
              deviceMakes={
                codesContext.codesDataLoader.data?.device_make?.map((data) => ({ label: data.name, value: data.id })) ??
                []
              }
            />
          </HorizontalSplitFormComponent>

          <Divider />

          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={1}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              onClick={() => {
                submitForm();
              }}>
              Save and Exit
            </LoadingButton>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                history.push(
                  `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/telemetry/manage`
                );
              }}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};
