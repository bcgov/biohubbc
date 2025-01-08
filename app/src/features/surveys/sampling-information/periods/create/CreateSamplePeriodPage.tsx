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
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { CreateSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import SamplingSiteHeader from '../../sites/components/SamplingSiteHeader';

export const CreateSamplingPeriodYupSchema = yup
  .object({
    method_technique_id: yup.number().nullable().default(null),
    survey_sample_site_id: yup.number().nullable().default(null),
    sample_periods: yup
      .array()
      .of(
        yup.object({
          start_date: yup
            .string()
            .typeError('Start Date is required')
            .min(1, 'Start Date is required')
            .isValidDateString()
            .default(null),
          end_date: yup
            .string()
            .typeError('End Date is required')
            .min(1, 'End Date is required')
            .isValidDateString()
            .isEndDateSameOrAfterStartDate('start_date')
            .default(null),
          start_time: yup.string().nullable().default(null),
          end_time: yup.string().nullable().default(null)
        })
      )
      .nullable()
      .default([])
      .test(
        'non-empty-array-validation',
        'Start and End Date are required for each period',
        function (value: ISurveySamplePeriodFormData['sample_periods']) {
          // Allow null or empty arrays of periods
          if (value === null || value.length === 0) {
            return true;
          }

          // Check that each period has a non-null start_date and end_date
          return value.every((item) => {
            return item.start_date !== null && item.end_date !== null;
          });
        }
      )
  })
  .test('at-least-one-defined', 'At least one of site, technique, or sample period is required', function (value) {
    const { survey_sample_site_id, method_technique_id, sample_periods } = value;

    const isSiteDefined = survey_sample_site_id !== null;

    const isTechniqueDefined = method_technique_id !== null;

    // Check if there is at least one sample period object. The validation above will handle if the contents are valid
    const isAtLeastOnePeriodDefined = Array.isArray(sample_periods) && sample_periods.length > 0;

    // At least one of the conditions must be true
    if (!isSiteDefined && !isTechniqueDefined && !isAtLeastOnePeriodDefined) {
      const errors = [
        this.createError({
          path: 'formError',
          message: 'At least one of site, technique, or sample period is required'
        })
      ];

      return new yup.ValidationError(errors);
    }

    return true;
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

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

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
      // Default optional fields to null if the value is an empty-string
      for (const period of values.sample_periods) {
        if (values.survey_sample_site_id) {
          samplePeriodData.push({
            survey_sample_site_id: values.survey_sample_site_id,
            method_technique_id: values.method_technique_id || null,
            start_date: period.start_date || null,
            start_time: period.start_time || null,
            end_date: period.end_date || null,
            end_time: period.end_time || null
          });
        } else if (values.method_technique_id) {
          samplePeriodData.push({
            survey_sample_site_id: values.survey_sample_site_id || null,
            method_technique_id: values.method_technique_id,
            start_date: period.start_date || null,
            start_time: period.start_time || null,
            end_date: period.end_date || null,
            end_time: period.end_time || null
          });
        } else if (period.start_date && period.end_date) {
          samplePeriodData.push({
            survey_sample_site_id: values.survey_sample_site_id || null,
            method_technique_id: values.method_technique_id || null,
            start_date: period.start_date,
            start_time: period.start_time || null,
            end_date: period.end_date,
            end_time: period.end_time || null
          });
        } else {
          throw new Error('At least one of site, technique, or sample period is required');
        }
      }

      await biohubApi.samplingPeriod.createSamplingPeriods(
        surveyContext.projectId,
        surveyContext.surveyId,
        samplePeriodData
      );

      // create complete, navigate back to observations page
      history.push(
        `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`,
        SKIP_CONFIRMATION_DIALOG
      );
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
