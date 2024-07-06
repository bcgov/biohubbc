import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { EditAnimalDeploymentI18N } from 'constants/i18n';
import {
  CreateAnimalDeployment,
  IAnimalDeployment,
  ICreateAnimalDeployment
} from 'features/surveys/view/survey-animals/telemetry-device/device';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import DeploymentHeader from '../components/DeploymentHeader';
import DeploymentForm from '../components/form/DeploymentForm';

/**
 * Renders the body content of the Deployment page.
 *
 * @return {*}
 */
const EditDeploymentPage = () => {
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const history = useHistory();

  const formikRef = useRef<FormikProps<ICreateAnimalDeployment>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  const urlParams: Record<string, string | number | undefined> = useParams();
  const deploymentId: number | undefined = Number(urlParams['deployment_id']);

  const critters = surveyContext.critterDataLoader.data ?? [];

  const deploymentDataLoader = useDataLoader(() =>
    biohubApi.survey.getDeploymentById(surveyContext.projectId, surveyContext.surveyId, deploymentId)
  );

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  useEffect(() => {
    deploymentDataLoader.load();
  }, []);

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const deployment = deploymentDataLoader.data as IAnimalDeployment;

  if (!deploymentDataLoader.data) {
    return <></>;
  }

  const {
    critter_id,
    device_id,
    frequency,
    frequency_unit,
    device_model,
    device_make,
    critterbase_start_capture_id,
    critterbase_end_capture_id,
    critterbase_end_mortality_id,
    attachment_end_date,
    attachment_end_time
  } = deployment;

  const initialDeploymentValues = {
    critter_id,
    device_id: String(device_id),
    frequency,
    frequency_unit,
    device_model,
    device_make,
    critterbase_start_capture_id,
    critterbase_end_capture_id,
    critterbase_end_mortality_id,
    attachment_end_date,
    attachment_end_time
  };
  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: EditAnimalDeploymentI18N.createErrorTitle,
      dialogText: EditAnimalDeploymentI18N.createErrorText,
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
      surveyContext.deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

      // create complete, navigate back to observations page
      history.push(
        `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/telemetry`,
        SKIP_CONFIRMATION_DIALOG
      );
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: EditAnimalDeploymentI18N.createErrorTitle,
        dialogText: EditAnimalDeploymentI18N.createErrorText,
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
            deployment_label={`${
              critters.find((critter) => critter.critter_id === critter_id)?.animal_id
            } - Device ${device_id}`}
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

export default EditDeploymentPage;
