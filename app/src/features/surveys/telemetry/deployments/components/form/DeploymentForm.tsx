import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { ISurveyCritter } from 'contexts/animalPageContext';
import { ICreateAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import DeploymentDetailsForm from './deployment-details/DeploymentDetailsForm';
import DeviceDetailsForm from './device-details/DeviceDetailsForm';
import DeploymentTimelineForm from './timeline/DeploymentTimelineForm';

interface IDeploymentCreateFormProps {
  isSubmitting: boolean;
}

const DeploymentCreateForm = (props: IDeploymentCreateFormProps) => {
  const { isSubmitting } = props;

  const surveyContext = useSurveyContext();

  const history = useHistory();

  const { submitForm, setFieldValue, values } = useFormikContext<ICreateAnimalDeployment>();
  const [selectedAnimal, setSelectedAnimal] = useState<ISurveyCritter | undefined>();

  console.log(values)

  const critterbaseApi = useCritterbaseApi();
  const telemetryApi = useTelemetryApi();

  const critterDataLoader = useDataLoader((critterbaseId: string) =>
    critterbaseApi.critters.getDetailedCritter(critterbaseId)
  );

  const frequencyUnitDataLoader = useDataLoader(() => telemetryApi.devices.getCodeValues('frequency_unit'));

  const deviceMakesDataLoader = useDataLoader(() => telemetryApi.devices.getCodeValues('device_make'));

  useEffect(() => {
    frequencyUnitDataLoader.load();
    deviceMakesDataLoader.load();
  }, []);

  // Get captures for selected animal
  useEffect(() => {
    if (selectedAnimal) {
      critterDataLoader.load(selectedAnimal.critterbase_critter_id);
      setFieldValue('critterbase_start_capture_id', '');
      setFieldValue('critterbase_end_capture_id', null);
    }
  }, [selectedAnimal]);

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <Stack gap={5}>
          <HorizontalSplitFormComponent
            title="Deployment Details"
            summary="Enter information about the deployment"
            component={
              <DeploymentDetailsForm
                animals={surveyContext.critterDataLoader.data ?? []}
                setSelectedAnimal={setSelectedAnimal}
                frequencyUnits={frequencyUnitDataLoader.data ?? []}
              />
            }
          />

          <Divider />

          <HorizontalSplitFormComponent
            title="Timeline"
            summary="Enter information about when the device was deployed"
            component={<DeploymentTimelineForm captures={critterDataLoader.data?.captures ?? []} 
            mortality={critterDataLoader.data?.mortality[0]}/>}
          />

          <Divider />

          <HorizontalSplitFormComponent
            title="Device Metadata"
            summary="Enter additional information about the device and optionally enable automatic data 
            retrievals for compatible device manufacturers."
            component={
              <DeviceDetailsForm
                deviceMakes={deviceMakesDataLoader.data?.map((data) => ({ label: data.code, value: data.code })) ?? []}
              />
            }
          />

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

export default DeploymentCreateForm;
