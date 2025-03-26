import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SamplePeriodI18N } from 'constants/i18n';
import {
  ISurveySamplePeriodFormData,
  SamplePeriodForm
} from 'features/surveys/sampling-information/periods/form/SamplePeriodForm';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { GetSamplingPeriod, UpdateSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import yup from 'utils/YupSchema';
import SamplingSiteHeader from '../../sites/components/SamplingSiteHeader';

export const EditSamplingSiteMethodPeriodYupSchema = yup.object({
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
          .min(1, 'End Date is required')
          .required('Start Date is required'),
        end_date: yup
          .string()
          .typeError('End Date is required')
          .isValidDateString()
          .min(1, 'End Date is required')
          .isEndDateSameOrAfterStartDate('start_date')
          .required('End Date is required'),
        start_time: yup.string().nullable().default(null),
        end_time: yup.string().nullable().default(null).isEndTimeAfterStartTime('start_time')
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
 * Renders page for editing a sampling period
 *
 * @return {*}
 */
export const EditSamplePeriodPage = () => {
  const history = useHistory();

  const dialogContext = useDialogContext();
  const codesContext = useCodesContext();
  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();

  const biohubApi = useBiohubApi();

  const { locationChangeInterceptor, skipUnsavedChangesDialog } = useUnsavedChangesDialog();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveySamplePeriodId = Number(urlParams['survey_sample_period_id']);

  const formikRef = useRef<FormikProps<ISurveySamplePeriodFormData>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const samplingPeriodDataLoader = useDataLoader(() =>
    biohubApi.samplingPeriod.getSamplePeriodById(surveyContext.projectId, surveyContext.surveyId, surveySamplePeriodId)
  );

  useEffect(() => {
    if (samplingPeriodDataLoader.data) {
      return;
    }

    samplingPeriodDataLoader.load();
  }, [codesContext.codesDataLoader, samplingPeriodDataLoader]);

  if (
    !surveyContext.surveyDataLoader.data ||
    !projectContext.projectDataLoader.data ||
    !samplingPeriodDataLoader.data
  ) {
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

      if (values.sample_periods.length > 1) {
        throw new Error('Only one sample period can be edited at a time');
      }

      const samplePeriod = values.sample_periods[0];

      // Transform the form data to match the API request format
      // Data should have already been validated by the Yup schema
      const samplePeriodData: UpdateSamplingPeriod = {
        survey_sample_site_id: values.survey_sample_site_id as number,
        method_technique_id: values.method_technique_id as number,
        start_date: samplePeriod.start_date as string,
        start_time: samplePeriod?.start_time || null,
        end_date: samplePeriod.end_date as string,
        end_time: samplePeriod?.end_time || null
      };

      await biohubApi.samplingPeriod.updateSamplingPeriod(
        surveyContext.projectId,
        surveyContext.surveyId,
        surveySamplePeriodId,
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

  const period: GetSamplingPeriod = samplingPeriodDataLoader.data;

  return (
    <>
      <Prompt when={true} message={locationChangeInterceptor} />
      <Formik
        innerRef={formikRef}
        initialValues={{
          survey_sample_site_id: period.survey_sample_site_id,
          method_technique_id: period.method_technique_id,
          sample_periods: [
            {
              survey_sample_period_id: period.survey_sample_period_id,
              start_date: period.start_date,
              start_time: period.start_time,
              end_date: period.end_date,
              end_time: period.end_time
            }
          ]
        }}
        validationSchema={EditSamplingSiteMethodPeriodYupSchema}
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
            title="Edit Sampling Period"
            breadcrumb="Edit Sampling Period"
          />
          <Box display="flex" flex="1 1 auto">
            <Container maxWidth="xl" sx={{ py: 3 }}>
              <Paper sx={{ p: 5 }}>
                <SamplePeriodForm isLoading={isSubmitting} editData={period} />
              </Paper>
            </Container>
          </Box>
        </Box>
      </Formik>
    </>
  );
};
