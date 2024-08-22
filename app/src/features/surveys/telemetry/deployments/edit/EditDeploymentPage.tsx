import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { EditAnimalDeploymentI18N } from 'constants/i18n';
import {
  DeploymentForm,
  DeploymentFormYupSchema
} from 'features/surveys/telemetry/deployments/components/form/DeploymentForm';
import { DeploymentFormHeader } from 'features/surveys/telemetry/deployments/components/form/DeploymentFormHeader';
import { ICreateAnimalDeployment } from 'features/surveys/view/survey-animals/telemetry-device/device';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';

/**
 * Renders the Edit Deployment page.
 *
 * @return {*}
 */
export const EditDeploymentPage = () => {
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const dialogContext = useDialogContext();
  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();

  const formikRef = useRef<FormikProps<ICreateAnimalDeployment>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const deploymentId: number | undefined = Number(urlParams['deployment_id']);

  const critters = surveyContext.critterDataLoader.data ?? [];

  const deploymentDataLoader = useDataLoader(biohubApi.survey.getDeploymentById);
  const deployment = deploymentDataLoader.data;

  useEffect(() => {
    deploymentDataLoader.load(surveyContext.projectId, surveyContext.surveyId, deploymentId);
  }, [deploymentDataLoader, deploymentId, surveyContext.projectId, surveyContext.surveyId]);

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data || !deployment) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const deploymentFormInitialValues = {
    critter_id: deployment.critter_id,
    device_id: String(deployment.device_id),
    frequency: deployment.frequency,
    frequency_unit: deployment.frequency_unit,
    device_model: deployment.device_model,
    device_make: deployment.device_make,
    critterbase_start_capture_id: deployment.critterbase_start_capture_id,
    critterbase_end_capture_id: deployment.critterbase_end_capture_id,
    critterbase_end_mortality_id: deployment.critterbase_end_mortality_id,
    attachment_end_date: deployment.attachment_end_date,
    attachment_end_time: deployment.attachment_end_time
  };

  const handleSubmit = async (values: ICreateAnimalDeployment) => {
    setIsSubmitting(true);

    try {
      const critter_id = Number(critters?.find((animal) => animal.critter_id === values.critter_id)?.critter_id);

      if (!critter_id) {
        throw new Error('Invalid critter data');
      }

      await biohubApi.survey.updateDeployment(surveyContext.projectId, surveyContext.surveyId, deploymentId, {
        critter_id: values.critter_id,
        device_id: Number(values.device_id),
        device_make: values.device_make,
        frequency: values.frequency,
        frequency_unit: values.frequency_unit,
        device_model: values.device_model,
        critterbase_start_capture_id: values.critterbase_start_capture_id,
        critterbase_end_capture_id: values.critterbase_end_capture_id,
        critterbase_end_mortality_id: values.critterbase_end_mortality_id,
        attachment_end_date: values.attachment_end_date,
        attachment_end_time: values.attachment_end_time
      });

      // edit complete, navigate back to telemetry page
      history.push(
        `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/telemetry`,
        SKIP_CONFIRMATION_DIALOG
      );
    } catch (error) {
      dialogContext.setErrorDialog({
        dialogTitle: EditAnimalDeploymentI18N.createErrorTitle,
        dialogText: EditAnimalDeploymentI18N.createErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError)?.errors,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        open: true
      });

      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Prompt when={true} message={locationChangeInterceptor} />
      <Formik
        innerRef={formikRef}
        initialValues={deploymentFormInitialValues}
        validationSchema={DeploymentFormYupSchema}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column">
          <DeploymentFormHeader
            project_id={surveyContext.projectId}
            project_name={projectContext.projectDataLoader.data?.projectData.project.project_name}
            survey_id={surveyContext.surveyId}
            survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
            is_submitting={isSubmitting}
            title="Edit Deployment"
            breadcrumb="Edit Deployment"
          />
          <Box display="flex" flex="1 1 auto">
            <DeploymentForm isSubmitting={isSubmitting} isEdit={true} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};
