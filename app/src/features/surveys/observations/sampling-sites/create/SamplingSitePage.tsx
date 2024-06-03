import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateSamplingSiteI18N } from 'constants/i18n';
import { SamplingSiteMethodYupSchema } from 'features/surveys/observations/sampling-sites/create/form/MethodForm';
import { Formik, FormikProps } from 'formik';
import { Feature } from 'geojson';
import History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { ICreateSamplingSiteRequest } from 'interfaces/useSamplingSiteApi.interface';
import { useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import SamplingSiteHeader from '../components/SamplingSiteHeader';
import { SamplingSiteMethodPeriodYupSchema } from '../periods/create/form/SamplingPeriodForm';
import SampleSiteCreateForm from './form/SampleSiteCreateForm';

export interface ISurveySampleSite {
  name: string;
  description: string;
  geojson: Feature;
}

/**
 * Renders the body content of the Sampling Site page.
 *
 * @return {*}
 */
const SamplingSitePage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const formikRef = useRef<FormikProps<ICreateSamplingSiteRequest>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const samplingSiteYupSchema = yup.object({
    survey_sample_sites: yup
      .array(
        yup.object({
          name: yup.string().default(''),
          description: yup.string().default(''),
          geojson: yup.object({})
        })
      )
      .min(1, 'At least one sampling site location is required'),
    sample_methods: yup
      .array()
      .of(
        SamplingSiteMethodYupSchema.shape({
          sample_periods: yup
            .array()
            .of(SamplingSiteMethodPeriodYupSchema)
            .min(
              1,
              'At least one sampling period is required for each method, describing when exactly you conducted this method at this site.'
            )
        })
      ) // Ensure each item in the array conforms to SamplingSiteMethodYupSchema
      .min(1, 'At least one sampling method is required') // Add check for at least one item in the array
  });

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

  const handleSubmit = async (values: ICreateSamplingSiteRequest) => {
    try {
      setIsSubmitting(true);

      await biohubApi.samplingSite.createSamplingSites(surveyContext.projectId, surveyContext.surveyId, values);

      // Disable cancel prompt so we can navigate away from the page after saving
      setEnableCancelCheck(false);

      // Refresh the context, so the next page loads with the latest data
      surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);

      // create complete, navigate back to observations page
      history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/observations`);
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

  /**
   * Intercepts all navigation attempts (when used with a `Prompt`).
   *
   * Returning true allows the navigation, returning false prevents it.
   *
   * @param {History.Location} location
   * @return {*}
   */
  const handleLocationChange = (location: History.Location) => {
    if (!dialogContext.yesNoDialogProps.open) {
      // If the cancel dialog is not open: open it
      dialogContext.setYesNoDialog({
        open: true,
        dialogTitle: CreateSamplingSiteI18N.cancelTitle,
        dialogText: CreateSamplingSiteI18N.cancelText,
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
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
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
        validationSchema={samplingSiteYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" height="100%">
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

export default SamplingSitePage;
