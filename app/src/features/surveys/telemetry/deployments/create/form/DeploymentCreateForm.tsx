import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { ISurveyCritter } from 'contexts/animalPageContext';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
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

  const history = useHistory();
  const { submitForm } = useFormikContext<ICreateSamplingSiteRequest>();
  const [selectedAnimal, setSelectedAnimal] = useState<ISurveyCritter | undefined>();

  const critterbaseApi = useCritterbaseApi();
  const telemetryApi = useTelemetryApi();

  const critterDataLoader = useDataLoader((critterbaseId: string) =>
    critterbaseApi.critters.getDetailedCritter(critterbaseId)
  );

  const frequencyUnitDataLoader = useDataLoader(() => telemetryApi.devices.getCodeValues('frequency_unit'));

  useEffect(() => {
    frequencyUnitDataLoader.load();
  }, []);

  // Get captures for selected animal
  useEffect(() => {
    if (selectedAnimal) {
      critterDataLoader.load(selectedAnimal.critterbase_critter_id);
    }
  }, [selectedAnimal]);

  const surveyContext = useSurveyContext();

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
            }></HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Timeline"
            summary="Enter information about start and end dates"
            component={
              <DeploymentTimelineForm captures={critterDataLoader.data?.captures ?? []} />
            }></HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Device Metadata"
            summary="Enter additional information about the device"
            component={<DeviceDetailsForm deviceMakes={[]} />}></HorizontalSplitFormComponent>

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
                  `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/observations`
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

export default DeploymentCreateForm;
