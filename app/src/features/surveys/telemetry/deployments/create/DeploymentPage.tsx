import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateSamplingSiteI18N } from 'constants/i18n';
import {
  CreateAnimalDeployment,
  ICreateAnimalDeployment
} from 'features/surveys/view/survey-animals/telemetry-device/device';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { useRef, useState } from 'react';
import { Prompt } from 'react-router';
import DeploymentHeader from '../components/DeploymentHeader';
import DeploymentCreateForm from './form/DeploymentCreateForm';

const initialDeploymentValues = {
  critter_id: '',
  device_id: '',
  frequency: undefined,
  frequency_unit: '',
  device_model: '',
  device_make: '',
  attachment_start_capture_id: '',
  attachment_end_capture_id: '',
  attachment_end_date: '',
  attachment_end_time: ''
};

/**
 * Renders the body content of the Deployment page.
 *
 * @return {*}
 */
const DeploymentPage = () => {
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const critters = surveyContext.critterDataLoader.data ?? [];

  const formikRef = useRef<FormikProps<ICreateAnimalDeployment>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateSamplingSiteI18N.createErrorTitle,
      dialogText: CreateSamplingSiteI18N.createErrorText,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmit = async (values: ICreateAnimalDeployment) => {
    setIsSubmitting(true);
    // Disable cancel prompt so we can navigate away from the page after saving
    setEnableCancelCheck(false);
    try {
      const critter = critters?.find((a) => a.critter_id === values.critter_id);

      if (!critter) {
        throw new Error('Invalid critter data');
      }

      await biohubApi.survey.addDeployment(
        surveyContext.projectId,
        surveyContext.surveyId,
        Number(critter.survey_critter_id),
        {
          critter_id: critter.critter_id,
          device_id: Number(values.device_id),
          device_make: values.device_make,
          frequency: values.frequency,
          frequency_unit: values.frequency_unit,
          device_model: values.device_model,
          attachment_start_capture_id: values.attachment_start_capture_id,
          attachment_end_capture_id: values.attachment_end_capture_id,
          attachment_end_date: values.attachment_end_date,
          attachment_end_time: values.attachment_end_time
        }
      );
      surveyContext.deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      // success snack bar
      dialogContext.setSnackbar({
        snackbarMessage: (
          <Typography variant="body2" component="div">
            Deployment Added
          </Typography>
        ),
        open: true
      });
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: CreateSamplingSiteI18N.createErrorTitle,
        dialogText: CreateSamplingSiteI18N.createErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError)?.errors
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Prompt when={enableCancelCheck} message={locationChangeInterceptor} />
      <Formik
        innerRef={formikRef}
        initialValues={initialDeploymentValues}
        validationSchema={CreateAnimalDeployment}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column">
          <DeploymentHeader
            project_id={surveyContext.projectId}
            survey_id={surveyContext.surveyId}
            survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
            project_name={projectContext.projectDataLoader.data?.projectData.project.project_name}
            is_submitting={isSubmitting}
            title="Add Deployment"
            breadcrumb="Add Deployments"
          />
          <Box display="flex" flex="1 1 auto">
            <DeploymentCreateForm isSubmitting={isSubmitting} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};

export default DeploymentPage;
