import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import { TelemetryDeviceI18N } from 'constants/i18n';
import { DeviceForm, DeviceFormYupSchema } from 'features/surveys/telemetry/manage/devices/form/DeviceForm';
import { DeviceFormHeader } from 'features/surveys/telemetry/manage/devices/form/DeviceFormHeader';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { UpdateTelemetryDevice } from 'interfaces/useTelemetryDeviceApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';

/**
 * Renders the Edit Device page.
 *
 * @return {*}
 */
export const EditDevicePage = () => {
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const dialogContext = useDialogContext();
  const projectContext = useProjectContext();
  const surveyContext = useSurveyContext();

  const formikRef = useRef<FormikProps<UpdateTelemetryDevice>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const deviceId: number | undefined = Number(urlParams['device_id']);

  const deviceDataLoader = useDataLoader(biohubApi.telemetryDevice.getDeviceById);

  useEffect(() => {
    deviceDataLoader.load(surveyContext.projectId, surveyContext.surveyId, deviceId);
  }, [deviceDataLoader, deviceId, surveyContext.projectId, surveyContext.surveyId]);

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data || !deviceDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const device = deviceDataLoader.data.device;

  const deviceFormInitialValues = {
    device_id: device.device_id,
    serial: device.serial,
    device_make_id: device.device_make_id,
    model: device.model,
    comment: device.comment
  };

  const handleSubmit = async (values: UpdateTelemetryDevice) => {
    setIsSubmitting(true);

    try {
      await biohubApi.telemetryDevice.updateDevice(surveyContext.projectId, surveyContext.surveyId, deviceId, {
        serial: values.serial,
        device_make_id: values.device_make_id,
        model: values.model,
        comment: values.comment
      });

      //   telemetryDataContext.devicesDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

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
        initialValues={deviceFormInitialValues}
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
            title="Edit Device"
            breadcrumb="Edit Device"
          />
          <Box display="flex" flex="1 1 auto">
            <DeviceForm isSubmitting={isSubmitting} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};
