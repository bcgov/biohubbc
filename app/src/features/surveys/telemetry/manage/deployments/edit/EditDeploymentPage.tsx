import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import { EditAnimalDeploymentI18N } from 'constants/i18n';
import {
  DeploymentForm,
  DeploymentFormYupSchema
} from 'features/surveys/telemetry/manage/deployments/form/DeploymentForm';
import { DeploymentFormHeader } from 'features/surveys/telemetry/manage/deployments/form/DeploymentFormHeader';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICreateAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
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

  const surveyContext = useSurveyContext();

  const { locationChangeInterceptor, skipUnsavedChangesDialog } = useUnsavedChangesDialog();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const deploymentId: number | undefined = Number(urlParams['deployment_id']);

  const formikRef = useRef<FormikProps<ICreateAnimalDeployment>>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const deploymentDataLoader = useDataLoader(() =>
    biohubApi.telemetryDeployment.getDeploymentById(surveyContext.surveyId, deploymentId)
  );

  useEffect(() => {
    if (!deploymentId) {
      return;
    }

    deploymentDataLoader.load();
  }, [deploymentDataLoader, deploymentId, surveyContext.surveyId]);

  if (!surveyContext.surveyDataLoader.data || !deploymentDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const deployment = deploymentDataLoader.data.deployment;

  const deploymentFormInitialValues = {
    critter_id: deployment.critter_id,
    device_id: deployment.device_id,
    frequency: deployment.frequency,
    frequency_unit_id: deployment.frequency_unit_id,
    attachment_start_date: deployment.attachment_start_date,
    attachment_start_time: deployment.attachment_start_time,
    attachment_end_date: deployment.attachment_end_date,
    attachment_end_time: deployment.attachment_end_time,
    critterbase_start_capture_id: deployment.critterbase_start_capture_id,
    critterbase_end_capture_id: deployment.critterbase_end_capture_id,
    critterbase_end_mortality_id: deployment.critterbase_end_mortality_id
  };

  const handleSubmit = async (values: ICreateAnimalDeployment) => {
    setIsSubmitting(true);

    try {
      await biohubApi.telemetryDeployment.updateDeployment(surveyContext.surveyId, deploymentId, {
        critter_id: values.critter_id,
        device_id: values.device_id,
        frequency: values.frequency,
        frequency_unit_id: values.frequency_unit_id,
        attachment_start_date: values.attachment_start_date,
        attachment_start_time: values.attachment_start_time,
        attachment_end_date: values.attachment_end_date,
        attachment_end_time: values.attachment_end_time,
        critterbase_start_capture_id: values.critterbase_start_capture_id,
        critterbase_end_capture_id: values.critterbase_end_capture_id,
        critterbase_end_mortality_id: values.critterbase_end_mortality_id
      });

      // edit complete, navigate back to telemetry page
      skipUnsavedChangesDialog();
      history.push(`/admin/surveys/${surveyContext.surveyId}/telemetry/manage`);
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
          <FormikErrorSnackbar />
          <DeploymentFormHeader
            survey_id={surveyContext.surveyId}
            survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
            is_submitting={isSubmitting}
            title="Edit Deployment"
            breadcrumb="Edit Deployment"
          />
          <Box display="flex" flex="1 1 auto">
            <DeploymentForm isSubmitting={isSubmitting} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};
