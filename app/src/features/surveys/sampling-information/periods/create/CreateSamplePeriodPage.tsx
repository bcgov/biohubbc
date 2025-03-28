import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SamplePeriodI18N } from 'constants/i18n';
import {
  InitialSurveySamplePeriodFormData,
  ISurveySamplePeriodFormData,
  SamplePeriodForm
} from 'features/surveys/sampling-information/periods/form/SamplePeriodForm';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { CreateSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import SamplingSiteHeader from '../../sites/components/SamplingSiteHeader';

const CreateSamplingPeriodYupSchema = yup.object({
  method_technique_id: yup.number().required('Technique is required'),
  survey_sample_site_id: yup.number().required('Site is required'),
  sample_periods: yup
    .array()
    .of(
      yup.object({
        start_date: yup
          .string()
          .typeError('Start Date is required')
          .isValidDateString()
          .required('Start Date is required'),
        end_date: yup
          .string()
          .typeError('End Date is required')
          .isValidDateString()
          .required('End Date is required')
          .isEndDateSameOrAfterStartDate('start_date'),
        start_time: yup.string().nullable().default(null),
        end_time: yup.string().nullable().default(null).isEndDateSameOrAfterStartDate('end_time')
      })
    )
    .test('checkAtLeastOnePeriod', 'At least one period is required', function (value) {
      const hasAtLeastOnPeriod = Array.isArray(value) && value.length > 0;

      if (!hasAtLeastOnPeriod) {
        return this.createError({ path: 'sample_periods', message: 'At least one period is required' });
      }

      return true;
    })
});

/**
 * Renders the body content of the Sampling Period page.
 *
 * @return {*}
 */
export const CreateSamplePeriodPage = () => {
  const history = useHistory();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const biohubApi = useBiohubApi();
  const codesContext = useCodesContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const formikRef = useRef<FormikProps<ISurveySamplePeriodFormData>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { locationChangeInterceptor, skipUnsavedChangesDialog } = useUnsavedChangesDialog();

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: SamplePeriodI18N.createErrorTitle,
      dialogText: SamplePeriodI18N.createErrorText,
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

  const handleSubmit = async (values: ISurveySamplePeriodFormData) => {
    try {
      setIsSubmitting(true);

      const samplePeriodData: CreateSamplingPeriod[] = [];

      // Transform the form data to match the API request format
      // Data should have already been validated by the Yup schema
      for (const period of values.sample_periods) {
        samplePeriodData.push({
          survey_sample_site_id: values.survey_sample_site_id as number,
          method_technique_id: values.method_technique_id as number,
          start_date: period.start_date as string,
          start_time: period.start_time || null,
          end_date: period.end_date as string,
          end_time: period.end_time || null
        });
      }

      await biohubApi.samplingPeriod.createSamplingPeriods(
        surveyContext.projectId,
        surveyContext.surveyId,
        samplePeriodData
      );

      // create complete, navigate back to observations page
      skipUnsavedChangesDialog();
      history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`);
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: SamplePeriodI18N.createErrorTitle,
        dialogText: SamplePeriodI18N.createErrorText,
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
        initialValues={InitialSurveySamplePeriodFormData}
        validationSchema={CreateSamplingPeriodYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column">
          <FormikErrorSnackbar />
          <SamplingSiteHeader
            project_id={surveyContext.projectId}
            survey_id={surveyContext.surveyId}
            survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
            project_name={projectContext.projectDataLoader.data.projectData.project.project_name}
            is_submitting={isSubmitting}
            title="Add Sampling Period"
            breadcrumb="Add Sampling Periods"
          />
          <Box display="flex" flex="1 1 auto">
            <Container maxWidth="xl" sx={{ py: 3 }}>
              <Paper sx={{ p: 5 }}>
                <SamplePeriodForm isLoading={isSubmitting} />
              </Paper>
            </Container>
          </Box>
        </Box>
      </Formik>
    </>
  );
};
