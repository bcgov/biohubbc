import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateSamplingSiteI18N } from 'constants/i18n';
import { ISurveySampleMethodFormData } from 'features/surveys/sampling-information/methods/components/SamplingMethodForm';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICreateSamplingSiteRequest, ISurveySampleSite } from 'interfaces/useSamplingSiteApi.interface';
import { IGetSurveyBlock, IGetSurveyStratum } from 'interfaces/useSurveyApi.interface';
import { useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import SamplingSiteHeader from '../components/SamplingSiteHeader';
import SampleSiteCreateForm, { SampleSiteCreateFormYupSchema } from './form/SampleSiteCreateForm';

/**
 * Interface for the form data used in the Create Sampling Site form.
 *
 * @export
 * @interface ICreateSampleSiteFormData
 */
export interface ICreateSampleSiteFormData {
  survey_id: number;
  survey_sample_sites: ISurveySampleSite[]; // extracted list from shape files
  sample_methods: ISurveySampleMethodFormData[];
  blocks: IGetSurveyBlock[];
  stratums: IGetSurveyStratum[];
}

/**
 * Renders the body content of the Sampling Site page.
 *
 * @return {*}
 */
export const CreateSamplingSitePage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const formikRef = useRef<FormikProps<ICreateSampleSiteFormData>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (values: ICreateSampleSiteFormData) => {
    try {
      setIsSubmitting(true);

      // Remove internal _id property of newly created sample_methods used only as a unique key prop
      const { sample_methods, ...otherValues } = values;

      const data: ICreateSamplingSiteRequest = {
        ...otherValues,
        sample_methods: sample_methods.map((method) => ({
          survey_sample_method_id: method.survey_sample_method_id,
          survey_sample_site_id: method.survey_sample_site_id,
          method_technique_id: method.technique.method_technique_id,
          description: method.description,
          sample_periods: method.sample_periods,
          method_response_metric_id: method.method_response_metric_id
        }))
      };

      await biohubApi.samplingSite.createSamplingSites(surveyContext.projectId, surveyContext.surveyId, data);

      // Refresh the context, so the next page loads with the latest data
      surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

      // create complete, navigate back to observations page
      history.push(
        `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`,
        SKIP_CONFIRMATION_DIALOG
      );
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
      <Prompt when={true} message={locationChangeInterceptor} />
      <Formik
        innerRef={formikRef}
        initialValues={{
          survey_id: surveyContext.surveyId,
          name: '',
          description: '',
          survey_sample_sites: [],
          sample_methods: [],
          blocks: [],
          stratums: []
        }}
        validationSchema={SampleSiteCreateFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column">
          <SamplingSiteHeader
            project_id={surveyContext.projectId}
            survey_id={surveyContext.surveyId}
            survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
            project_name={projectContext.projectDataLoader.data.projectData.project.project_name}
            is_submitting={isSubmitting}
            title="Add Sampling Site"
            breadcrumb="Add Sampling Sites"
          />
          <Box display="flex" flex="1 1 auto">
            <SampleSiteCreateForm isSubmitting={isSubmitting} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};
