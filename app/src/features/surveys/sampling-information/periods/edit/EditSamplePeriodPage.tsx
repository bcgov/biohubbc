import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SamplePeriodI18N } from 'constants/i18n';
import dayjs from 'dayjs';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { IGetSamplePeriodDetails } from 'interfaces/usePeriodApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import yup from 'utils/YupSchema';
import SamplingSiteHeader from '../../sites/components/SamplingSiteHeader';
import { ISurveySampleMethodPeriodData } from '../form/components/sites/periods/SamplePeriodPeriodForm';
import EditSamplePeriodForm from '../form/edit/EditSamplePeriodForm';

export const EditSamplingSiteMethodPeriodYupSchema = yup.object({
  method_technique_id: yup.number().required('Technique is required'),
  sample_site: yup
    .object({
      survey_sample_site_id: yup.number().required('Site is required'),
      name: yup.string().required('Site name is required'),
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
            .test(
              'checkDatesAreSameAndEndTimeIsAfterStart',
              'End time must be after start time for the same day',
              function (value) {
                const { start_date, end_date, start_time, end_time } = value || {};
                if (start_date === end_date && start_time && end_time) {
                  return dayjs(`${start_date} ${start_time}`, 'YYYY-MM-DD HH:mm:ss').isBefore(
                    dayjs(`${end_date} ${end_time}`, 'YYYY-MM-DD HH:mm:ss')
                  );
                }
                return true;
              }
            )
        )
        .required('Sample periods are required')
        .min(1, 'At least one sample period is required')
    })
    .required('Sample site is required')
});

/**
 * Interface for the form data used in the Create Sampling Period form.
 *
 * @export
 * @interface IEditSamplePeriodFormData
 */
export interface IEditSamplePeriodFormData {
  method_technique_id: number;
  sample_site: {
    survey_sample_site_id: number;
    name: string;
    sample_periods: ISurveySampleMethodPeriodData[];
  };
}

/**
 * Renders page for editing a sampling period
 *
 * @return {*}
 */
export const EditSamplePeriodPage = () => {
  const history = useHistory();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveySamplePeriodId = Number(urlParams['survey_sample_period_id']);

  const biohubApi = useBiohubApi();
  const codesContext = useCodesContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, []);

  const samplingPeriodDataLoader = useDataLoader(() =>
    biohubApi.period.getSamplePeriodById(surveyContext.projectId, surveyContext.surveyId, surveySamplePeriodId)
  );

  if (!samplingPeriodDataLoader.data) {
    samplingPeriodDataLoader.load();
  }

  const formikRef = useRef<FormikProps<IEditSamplePeriodFormData>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

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

  const handleSubmit = async (values: IEditSamplePeriodFormData) => {
    try {
      setIsSubmitting(true);

      await biohubApi.period.updateSamplePeriod(
        surveyContext.projectId,
        surveyContext.surveyId,
        values.sample_site.survey_sample_site_id,
        {
          method_technique_id: values.method_technique_id,
          sample_period: values.sample_site.sample_periods[0]
        }
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

  const period: IGetSamplePeriodDetails = samplingPeriodDataLoader.data;

  return (
    <>
      <Prompt when={true} message={locationChangeInterceptor} />
      <Formik
        innerRef={formikRef}
        initialValues={{
          method_technique_id: period.method_technique.method_technique_id,
          sample_site: {
            survey_sample_site_id: period.survey_sample_site.survey_sample_site_id,
            name: period.survey_sample_site.name,
            sample_periods: [
              {
                survey_sample_period_id: period.survey_sample_period_id,
                survey_sample_method_id: period.survey_sample_method_id,
                start_date: period.start_date,
                start_time: period.start_time,
                end_date: period.end_date,
                end_time: period.end_time
              }
            ]
          }
        }}
        validationSchema={EditSamplingSiteMethodPeriodYupSchema}
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
            title="Edit Sampling Period"
            breadcrumb="Edit Sampling Period"
          />
          <Box display="flex" flex="1 1 auto">
            <EditSamplePeriodForm isSubmitting={isSubmitting} initialTechnique={period.method_technique} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};
