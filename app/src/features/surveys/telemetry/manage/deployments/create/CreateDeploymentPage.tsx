import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import { CreateAnimalDeploymentI18N } from 'constants/i18n';
import {
  DeploymentForm,
  DeploymentFormInitialValues,
  DeploymentFormYupSchema
} from 'features/surveys/telemetry/manage/deployments/form/DeploymentForm';
import { DeploymentFormHeader } from 'features/surveys/telemetry/manage/deployments/form/DeploymentFormHeader';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
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

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const formikRef = useRef<FormikProps<ICreateAnimalDeployment>>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const handleSubmit = async (values: ICreateAnimalDeployment) => {
    setIsSubmitting(true);

    try {
      await biohubApi.telemetryDeployment.createDeployment(
        surveyContext.projectId,
        surveyContext.surveyId,
        values.critter_id,
        {
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
        }
      );

      // create complete, navigate back to telemetry page
      history.push(
        `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/telemetry/manage`,
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
            breadcrumb="Add Deployment"
          />
          <Box display="flex" flex="1 1 auto">
            <DeploymentForm isSubmitting={isSubmitting} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};
