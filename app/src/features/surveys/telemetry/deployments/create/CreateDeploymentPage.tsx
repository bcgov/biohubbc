import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { CreateAnimalDeploymentI18N } from 'constants/i18n';
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
import { Prompt, useHistory } from 'react-router';

const initialDeploymentValues = {
  critter_id: '' as unknown as number,
  device_id: '',
  frequency: undefined,
  frequency_unit: undefined,
  device_model: '',
  device_make: '',
  critterbase_start_capture_id: '',
  critterbase_end_capture_id: null,
  critterbase_end_mortality_id: null,
  attachment_end_date: null,
  attachment_end_time: null
};

/**
 * Renders the Create Deployment page.
 *
 * @return {*}
 */
export const CreateDeploymentPage = () => {
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const history = useHistory();

  const critters = surveyContext.critterDataLoader.data ?? [];

  const deploymentDataLoader = useDataLoader(biohubApi.survey.getDeploymentsInSurvey);

  useEffect(() => {
    deploymentDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  }, [deploymentDataLoader, surveyContext.projectId, surveyContext.surveyId]);

  const formikRef = useRef<FormikProps<ICreateAnimalDeployment>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

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

      deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

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
        initialValues={initialDeploymentValues}
        validationSchema={DeploymentFormYupSchema}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column">
          <DeploymentFormHeader
            project_id={surveyContext.projectId}
            survey_id={surveyContext.surveyId}
            survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
            project_name={projectContext.projectDataLoader.data?.projectData.project.project_name}
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
