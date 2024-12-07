import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SamplePeriodI18N } from 'constants/i18n';
import dayjs from 'dayjs';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICreateSamplingPeriodRequest } from 'interfaces/useSamplingPeriodApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import SamplingSiteHeader from '../../sites/components/SamplingSiteHeader';
import { ISurveySampleMethodPeriodData } from '../form/components/sites/periods/SamplePeriodPeriodForm';
import CreateSamplePeriodForm from '../form/create/CreateSamplePeriodForm';

export const SamplingSiteMethodPeriodYupSchema = yup.object({
  method_technique_id: yup.number().required('Technique is required'),
  sample_sites: yup
    .array()
    .of(
      yup.object({
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
      })
    )
    .required('Sample sites are required')
    .min(1, 'At least one sample site is required')
});

export interface ISurveySampleMethodFormData {
  _id?: string; // Internal ID used only for a unique key prop. Should not be sent to the API.
  survey_sample_method_id: number | null;
  survey_sample_site_id: number | null;
  method_response_metric_id: number | null;
  description: string;
  technique: {
    method_technique_id: number | null;
  };
  sample_periods: ISurveySampleMethodPeriodData[];
}

/**
 * Interface for the form data used in the Create Sampling Period form.
 *
 * @export
 * @interface ICreateSamplePeriodFormData
 */
export interface ICreateSamplePeriodFormData {
  method_technique_id: number;
  sample_sites: {
    survey_sample_site_id: number;
    sample_periods: ISurveySampleMethodPeriodData[];
  }[];
}

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
  }, []);

  const formikRef = useRef<FormikProps<ICreateSamplePeriodFormData>>(null);
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

  const handleSubmit = async (values: ICreateSamplePeriodFormData) => {
    try {
      setIsSubmitting(true);

      const MOCK_METHOD_RESPONSE_METRIC_ID = codesContext.codesDataLoader.data?.method_response_metrics[0].id as number;

      // Remove the temporary v4() id used as a formik key
      const data: ICreateSamplingPeriodRequest = {
        method_technique_id: values.method_technique_id,
        sample_sites: values.sample_sites.map((site) => ({
          survey_sample_site_id: site.survey_sample_site_id,
          method_response_metric_id: MOCK_METHOD_RESPONSE_METRIC_ID,
          sample_periods: site.sample_periods.map((period) => ({
            survey_sample_period_id: null,
            survey_sample_method_id: null,
            start_date: period.start_date,
            start_time: period.start_time,
            end_date: period.end_date,
            end_time: period.end_time
          }))
        }))
      };
      await biohubApi.period.createSamplePeriods(surveyContext.projectId, surveyContext.surveyId, data);

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
        initialValues={{
          method_technique_id: '' as unknown as number,
          sample_sites: []
        }}
        validationSchema={SamplingSiteMethodPeriodYupSchema}
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
            <CreateSamplePeriodForm isSubmitting={isSubmitting} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};
