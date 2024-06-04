import CircularProgress from '@mui/material/CircularProgress';
import { Box } from '@mui/system';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateTechniqueI18N } from 'constants/i18n';
import { Formik, FormikProps } from 'formik';
import History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { ICreateTechniqueRequest } from 'interfaces/useTechniqueApi.interface';
import { useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import SamplingTechniqueHeader from './SamplingTechniqueHeader';
import TechniqueCreateForm from './technique/form/TechniqueCreateForm';

/**
 * Renders the body content of the Technique page.
 *
 * @return {*}
 */
const TechniqueTechniquePage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const formikRef = useRef<FormikProps<ICreateTechniqueRequest>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const techniqueYupSchema = yup.object({
    name: yup.string().required('Name is required.'),
    description: yup.string().nullable(),
    distance_threshold: yup.number().nullable(),
    method_technique_id: yup.number().required('A method type is required.'),
    quantitative_attributes: yup.array(yup.object({ method_technique_attribute_quantitative_id: yup.string().uuid() })),
    qualitative_attributes: yup.array(yup.object({ method_technique_attribute_qualitative_id: yup.string().uuid() }))
  });

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateTechniqueI18N.createErrorTitle,
      dialogText: CreateTechniqueI18N.createErrorText,
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

  const handleSubmit = async (values: ICreateTechniqueRequest) => {
    try {
      setIsSubmitting(true);

      await biohubApi.technique.createTechnique(surveyContext.projectId, surveyContext.surveyId, values);

      // Refresh the context, so the next page loads with the latest data
      surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

      // create complete, navigate back to observations page
      history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/manage-sampling`);
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: CreateTechniqueI18N.createErrorTitle,
        dialogText: CreateTechniqueI18N.createErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError)?.errors
      });
      setIsSubmitting(false);
    }
  };

  /**
   * Intercepts all navigation attempts (when used with a `Prompt`).
   *
   * Returning true allows the navigation, returning false prevents it.
   *
   * @param {History.Location} location
   * @return {*}
   */
  const handleLocationChange = (location: History.Location) => {
    if (!dialogContext.yesNoDialogProps.open && !isSubmitting) {
      // If the cancel dialog is not open: open it
      dialogContext.setYesNoDialog({
        open: true,
        dialogTitle: CreateTechniqueI18N.cancelTitle,
        dialogText: CreateTechniqueI18N.cancelText,
        onClose: () => {
          dialogContext.setYesNoDialog({ open: false });
        },
        onNo: () => {
          dialogContext.setYesNoDialog({ open: false });
        },
        onYes: () => {
          dialogContext.setYesNoDialog({ open: false });
          history.push(location.pathname);
        }
      });
      return false;
    }

    // If the cancel dialog is already open and another location change action is triggered: allow it
    return true;
  };

  return (
    <>
      <Prompt when={!isSubmitting} message={handleLocationChange} />
      <Formik
        innerRef={formikRef}
        initialValues={{
          survey_id: surveyContext.surveyId,
          name: '',
          description: '',
          distance_threshold: null,
          method_technique_id: null,
          attractants: [],
          attributes: [],
          qualitative_attributes: [],
          quantitative_attributes: []
        }}
        validationSchema={techniqueYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" height="100%">
          <SamplingTechniqueHeader
            project_id={surveyContext.projectId}
            survey_id={surveyContext.surveyId}
            survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
            project_name={projectContext.projectDataLoader.data.projectData.project.project_name}
            is_submitting={isSubmitting}
            title="Add Technique"
            breadcrumb="Add Technique"
          />
          <Box display="flex" flex="1 1 auto">
            <TechniqueCreateForm isSubmitting={isSubmitting} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};

export default TechniqueTechniquePage;
