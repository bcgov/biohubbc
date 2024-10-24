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
} from 'features/surveys/telemetry/manage/deployments/form/deployment-details/DeploymentDetailsForm';
import {
  DeploymentTimelineForm,
  DeploymentTimelineFormInitialValues,
  DeploymentTimelineFormYupSchema
} from 'features/surveys/telemetry/manage/deployments/form/timeline/DeploymentTimelineForm';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
import { useEffect } from 'react';
import { useHistory } from 'react-router';

export const DeploymentFormInitialValues = {
  ...DeploymentDetailsFormInitialValues,
  ...DeploymentTimelineFormInitialValues
};

export const DeploymentFormYupSchema = DeploymentDetailsFormYupSchema.concat(DeploymentTimelineFormYupSchema);

interface IDeploymentFormProps {
  isSubmitting: boolean;
  isEdit?: boolean;
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

  const critterDataLoader = useDataLoader((critterId: number) =>
    biohubApi.survey.getCritterById(surveyContext.projectId, surveyContext.surveyId, critterId)
  );

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
              surveyAnimals={surveyContext.critterDataLoader.data ?? []}
              frequencyUnits={
                codesContext.codesDataLoader.data?.frequency_unit?.map((data) => ({
                  label: data.name,
                  value: data.id
                })) ?? []
              }
            />
          </HorizontalSplitFormComponent>

          <Divider />

          <HorizontalSplitFormComponent title="Timeline" summary="Enter information about when the device was deployed">
            <DeploymentTimelineForm
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
