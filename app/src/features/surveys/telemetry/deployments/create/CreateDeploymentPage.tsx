import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import { CreateAnimalDeploymentI18N } from 'constants/i18n';
import {
  DeploymentForm,
  DeploymentFormInitialValues,
  DeploymentFormYupSchema
} from 'features/surveys/telemetry/deployments/components/form/DeploymentForm';
import { DeploymentFormHeader } from 'features/surveys/telemetry/deployments/components/form/DeploymentFormHeader';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext, useTelemetryDataContext } from 'hooks/useContext';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICreateAnimalDeployment } from 'interfaces/useTelemetryApi.interface';
import { useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';

/**
 * Renders the Create Deployment page.
 *
 * @return {*}
 */
export const CreateDeploymentPage = () => {
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const dialogContext = useDialogContext();
  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();
  const telemetryDataContext = useTelemetryDataContext();

  const formikRef = useRef<FormikProps<ICreateAnimalDeployment>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const critters = surveyContext.critterDataLoader.data ?? [];

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const handleSubmit = async (values: ICreateAnimalDeployment) => {
    setIsSubmitting(true);

    try {
      const critter_id = Number(critters?.find((animal) => animal.critter_id === values.critter_id)?.critter_id);

      if (!critter_id) {
        throw new Error('Invalid critter data');
      }

      await biohubApi.survey.createDeployment(surveyContext.projectId, surveyContext.surveyId, critter_id, {
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

      telemetryDataContext.deploymentsDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

      // create complete, navigate back to telemetry page
      history.push(
        `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/telemetry`,
        SKIP_CONFIRMATION_DIALOG
      );
    } catch (error) {
      dialogContext.setErrorDialog({
        dialogTitle: CreateAnimalDeploymentI18N.createErrorTitle,
        dialogText: CreateAnimalDeploymentI18N.createErrorText,
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
        initialValues={DeploymentFormInitialValues}
        validationSchema={DeploymentFormYupSchema}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column">
          <FormikErrorSnackbar />
          <DeploymentFormHeader
            project_id={surveyContext.projectId}
            project_name={projectContext.projectDataLoader.data?.projectData.project.project_name}
            survey_id={surveyContext.surveyId}
            survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
            is_submitting={isSubmitting}
            title="Add Deployment"
            breadcrumb="Add Deployments"
          />
          <Box display="flex" flex="1 1 auto">
            <DeploymentForm isSubmitting={isSubmitting} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};
