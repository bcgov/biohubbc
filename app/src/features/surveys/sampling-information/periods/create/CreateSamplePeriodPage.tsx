import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SamplePeriodI18N } from 'constants/i18n';
import dayjs from 'dayjs';
import {
  InitialSurveySamplePeriodFormData,
  ISurveySamplePeriodFormData,
  SamplePeriodForm2
} from 'features/surveys/sampling-information/periods/form/SamplePeriodForm2';
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

export const CreateSamplingPeriodYupSchema = yup.object({
  method_technique_id: yup.number().required('Technique is required'),
  survey_sample_site_id: yup.number().required('Site is required'),
  sample_periods: yup
    .array()
    .of(
      yup
        .object({
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
          start_time: yup.string().when('end_time', {
            is: (val: string | null) => val && val !== null,
            then: yup.string().typeError('Start Time is required').required('Start Time is required'),
            otherwise: yup.string().nullable()
          }),
          end_time: yup.string().nullable()
        })
        .test('checkDatesAreSameAndEndTimeIsAfterStart', 'End date must be after start date', function (value) {
          const { start_date, end_date, start_time, end_time } = value || {};
          if (start_date === end_date && start_time && end_time) {
            return dayjs(`${start_date} ${start_time}`, 'YYYY-MM-DD HH:mm:ss').isBefore(
              dayjs(`${end_date} ${end_time}`, 'YYYY-MM-DD HH:mm:ss')
            );
          }
          return true;
        })
    )
    .required('Sample periods are required')
    .min(1, 'At least one sample period is required')
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
      for (const period of values.sample_periods) {
        samplePeriodData.push({
          survey_sample_site_id: values.survey_sample_site_id,
          method_technique_id: values.method_technique_id,
          start_date: period.start_date,
          start_time: period.start_time || null,
          end_date: period.end_date,
          end_time: period.end_time || null
        });
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
                <SamplePeriodForm2 isLoading={isSubmitting} />
              </Paper>
            </Container>
          </Box>
        </Box>
      </Formik>
    </>
  );
};
