import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import {
  DeploymentDetailsForm,
  DeploymentDetailsFormInitialValues,
  DeploymentDetailsFormYupSchema
} from 'features/surveys/telemetry/manage/deployments/form/deployment-details/DeploymentDetailsForm';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
import { useEffect } from 'react';
import { useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import {
  DeploymentEndForm,
  DeploymentEndFormInitialValues,
  DeploymentEndFormYupSchema
} from './timeline/DeploymentEndForm';
import {
  DeploymentStartForm,
  DeploymentStartFormInitialValues,
  DeploymentStartFormYupSchema
} from './timeline/DeploymentStartForm';

export const DeploymentFormInitialValues = {
  ...DeploymentDetailsFormInitialValues,
  ...DeploymentStartFormInitialValues,
  ...DeploymentEndFormInitialValues
};

export const DeploymentFormYupSchema =
  DeploymentDetailsFormYupSchema.concat(DeploymentStartFormYupSchema).concat(DeploymentEndFormYupSchema);

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

  const codesContext = useCodesContext();
  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();

  const history = useHistory();

  // Fetch all devices for the survey
  const devicesDataLoader = useDataLoader(() => biohubApi.telemetryDevice.getDevicesInSurvey(surveyContext.surveyId));

  // Fetch all critters for the survey
  const crittersDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCritters(surveyContext.surveyId));

  useEffect(() => {
    codesContext.codesDataLoader.load();
    devicesDataLoader.load();
    crittersDataLoader.load();
  }, [
    codesContext.codesDataLoader,
    crittersDataLoader,
    devicesDataLoader,
    surveyContext.projectId,
    surveyContext.surveyId
  ]);

  // Fetch a single critter's data
  const critterDataLoader = useDataLoader((critterId: number) =>
    biohubApi.survey.getCritterById(surveyContext.surveyId, critterId)
  );

  // Fetch individual critter data when critter_id changes (ie. when the user selects a critter)
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
          <HorizontalSplitFormComponent
            title="Deployment Details"
            summary={
              <>
                Enter information about the device and animal.
                <Typography color="textSecondary" component="span" display="block">
                  You must&nbsp;
                  <Typography
                    sx={{
                      textDecoration: 'none'
                    }}
                    component={RouterLink}
                    to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/telemetry/manage/device/create`}>
                    add the device
                  </Typography>
                  &nbsp;and&nbsp;
                  <Typography
                    sx={{
                      textDecoration: 'none'
                    }}
                    component={RouterLink}
                    to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/animals/create`}>
                    animal
                  </Typography>
                  &nbsp;to your Survey before associating the two in a deployment.
                </Typography>
              </>
            }>
            <DeploymentDetailsForm
              surveyAnimals={crittersDataLoader.data ?? []}
              surveyDevices={devicesDataLoader.data?.devices ?? []}
              frequencyUnits={
                codesContext.codesDataLoader.data?.frequency_units?.map((frequencyUnit) => ({
                  label: frequencyUnit.name,
                  value: frequencyUnit.id
                })) ?? []
              }
            />
          </HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="Start Date"
            summary="Select the capture when the device was deployed, and enter a start time to truncate the data to a specific time range.">
            <DeploymentStartForm captures={critterDataLoader.data?.captures ?? []} />
          </HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent
            title="End Date (optional)"
            summary="Enter information about when the deployment ended">
            <DeploymentEndForm
              captures={critterDataLoader.data?.captures ?? []}
              mortalities={critterDataLoader.data?.mortality ?? []}
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
