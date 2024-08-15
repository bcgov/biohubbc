import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import {
  DeploymentDetailsForm,
  DeploymentDetailsFormInitialValues,
  DeploymentDetailsFormYupSchema
} from 'features/surveys/telemetry/deployments/components/form/deployment-details/DeploymentDetailsForm';
import {
  DeploymentDeviceDetailsForm,
  DeploymentDeviceDetailsFormInitialValues,
  DeploymentDeviceDetailsFormYupSchema
} from 'features/surveys/telemetry/deployments/components/form/device-details/DeploymentDeviceDetailsForm';
import {
  DeploymentTimelineForm,
  DeploymentTimelineFormInitialValues,
  DeploymentTimelineFormYupSchema
} from 'features/surveys/telemetry/deployments/components/form/timeline/DeploymentTimelineForm';
import { ICreateAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect } from 'react';
import { useHistory } from 'react-router';

export const DeploymentFormInitialValues = {
  ...DeploymentDetailsFormInitialValues,
  ...DeploymentDeviceDetailsFormInitialValues,
  ...DeploymentTimelineFormInitialValues
};

export const DeploymentFormYupSchema = DeploymentDeviceDetailsFormYupSchema.concat(
  DeploymentTimelineFormYupSchema
).concat(DeploymentDetailsFormYupSchema);

interface IDeploymentFormProps {
  isSubmitting: boolean;
}

/**
 * Deployment form component.
 *
 * @param {IDeploymentFormProps} props
 * @return {*}
 */
export const DeploymentForm = (props: IDeploymentFormProps) => {
  const { isSubmitting } = props;

  const { submitForm, values } = useFormikContext<ICreateAnimalDeployment>();

  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  const telemetryApi = useTelemetryApi();

  const history = useHistory();

  const critterDataLoader = useDataLoader((critterId: number) =>
    biohubApi.survey.getCritterById(surveyContext.projectId, surveyContext.surveyId, critterId)
  );

  const frequencyUnitDataLoader = useDataLoader(() => telemetryApi.devices.getCodeValues('frequency_unit'));

  const deviceMakesDataLoader = useDataLoader(() => telemetryApi.devices.getCodeValues('device_make'));

  // Fetch frequency unit and device make code values on component mount
  useEffect(() => {
    frequencyUnitDataLoader.load();
    deviceMakesDataLoader.load();
  }, [critterDataLoader, deviceMakesDataLoader, frequencyUnitDataLoader]);

  // Fetch critter data when critter_id changes (ie. when the user selects a critter)
  useEffect(() => {
    if (values.critter_id) {
      critterDataLoader.refresh(values.critter_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.critter_id]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <Stack gap={5}>
          <HorizontalSplitFormComponent title="Deployment Details" summary="Enter information about the deployment">
            <DeploymentDetailsForm
              animals={surveyContext.critterDataLoader.data ?? []}
              frequencyUnits={frequencyUnitDataLoader.data ?? []}
            />
          </HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent title="Timeline" summary="Enter information about when the device was deployed">
            <DeploymentTimelineForm
              captures={critterDataLoader.data?.captures ?? []}
              mortality={critterDataLoader.data?.mortality[0]}
            />
          </HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Device Metadata"
            summary="Enter additional information about the device and optionally enable automatic data 
            retrievals for compatible device makes">
            <DeploymentDeviceDetailsForm
              deviceMakes={deviceMakesDataLoader.data?.map((data) => ({ label: data.code, value: data.code })) ?? []}
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
                history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/telemetry`);
              }}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};
