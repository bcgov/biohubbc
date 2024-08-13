import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { DeploymentDetailsForm } from 'features/surveys/telemetry/deployments/components/form/deployment-details/DeploymentDetailsForm';
import { DeploymentDeviceDetailsForm } from 'features/surveys/telemetry/deployments/components/form/device-details/DeploymentDeviceDetailsForm';
import { DeploymentTimelineForm } from 'features/surveys/telemetry/deployments/components/form/timeline/DeploymentTimelineForm';
import { ICreateAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

interface IDeploymentFormProps {
  isSubmitting: boolean;
}

export const DeploymentForm = (props: IDeploymentFormProps) => {
  const { isSubmitting } = props;

  const surveyContext = useSurveyContext();
  const { projectId, surveyId } = surveyContext;

  const history = useHistory();

  const { submitForm, values } = useFormikContext<ICreateAnimalDeployment>();
  const [selectedAnimal, setSelectedAnimal] = useState<number | null>(values.critter_id);

  const telemetryApi = useTelemetryApi();
  const biohubApi = useBiohubApi();

  const critterDataLoader = useDataLoader((critterId: number) =>
    biohubApi.survey.getCritterById(projectId, surveyId, critterId)
  );

  const frequencyUnitDataLoader = useDataLoader(() => telemetryApi.devices.getCodeValues('frequency_unit'));

  const deviceMakesDataLoader = useDataLoader(() => telemetryApi.devices.getCodeValues('device_make'));

  useEffect(() => {
    frequencyUnitDataLoader.load();
    deviceMakesDataLoader.load();
    if (values.critter_id) {
      critterDataLoader.load(values.critter_id);
    }
  }, [critterDataLoader, deviceMakesDataLoader, frequencyUnitDataLoader, values.critter_id]);

  // useEffect(() => {
  //   if (critterDataLoader.data) {
  //     setSelectedAnimal({
  //       critter_id: critterDataLoader.data.critter_id,
  //       critterbase_critter_id: critterDataLoader.data.critterbase_critter_id
  //     });
  //   }
  // }, [critterDataLoader.data]);

  // Get captures for selected animal
  useEffect(() => {
    if (selectedAnimal) {
      // setFieldValue('critterbase_start_capture_id', '');
      // setFieldValue('critterbase_end_capture_id', null);
      critterDataLoader.refresh(selectedAnimal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAnimal]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <Stack gap={5}>
          <HorizontalSplitFormComponent title="Deployment Details" summary="Enter information about the deployment">
            <DeploymentDetailsForm
              animals={surveyContext.critterDataLoader.data ?? []}
              setSelectedAnimal={setSelectedAnimal}
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
