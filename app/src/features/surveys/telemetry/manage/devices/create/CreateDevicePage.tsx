import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import { TelemetryDeviceI18N } from 'constants/i18n';
import {
  DeviceForm,
  DeviceFormInitialValues,
  DeviceFormYupSchema
} from 'features/surveys/telemetry/manage/devices/form/DeviceForm';
import { DeviceFormHeader } from 'features/surveys/telemetry/manage/devices/form/DeviceFormHeader';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { CreateTelemetryDevice } from 'interfaces/useTelemetryDeviceApi.interface';
import { useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';

/**
 * Renders the Create Device page.
 *
 * @return {*}
 */
export const CreateDevicePage = () => {
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const dialogContext = useDialogContext();
  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();

  const formikRef = useRef<FormikProps<CreateTelemetryDevice>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const handleSubmit = async (values: CreateTelemetryDevice) => {
    setIsSubmitting(true);

    try {
      await biohubApi.telemetryDevice.createDevice(surveyContext.projectId, surveyContext.surveyId, {
        serial: values.serial,
        device_make_id: values.device_make_id,
        model: values.model,
        comment: values.comment
      });

      history.push(
        `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/telemetry/manage`,
        SKIP_CONFIRMATION_DIALOG
      );
    } catch (error) {
      dialogContext.setErrorDialog({
        dialogTitle: TelemetryDeviceI18N.createErrorTitle,
        dialogText: TelemetryDeviceI18N.createErrorText,
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
        initialValues={DeviceFormInitialValues}
        validationSchema={DeviceFormYupSchema}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column">
          <FormikErrorSnackbar />
          <DeviceFormHeader
            project_id={surveyContext.projectId}
            project_name={projectContext.projectDataLoader.data?.projectData.project.project_name}
            survey_id={surveyContext.surveyId}
            survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
            is_submitting={isSubmitting}
            title="Add Device"
            breadcrumb="Add Devices"
          />
          <Box display="flex" flex="1 1 auto">
            <DeviceForm isSubmitting={isSubmitting} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};
