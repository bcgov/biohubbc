import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SamplePeriodI18N } from 'constants/i18n';
import dayjs from 'dayjs';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import SamplingSiteHeader from '../../sites/components/SamplingSiteHeader';
import CreateSamplePeriodForm from '../form/CreateSamplePeriodForm';
import {
  ISurveySampleMethodPeriodData,
  SurveySampleMethodPeriodArrayItemInitialValues
} from '../form/sites/periods/SamplePeriodPeriodForm';

export const SamplingSiteMethodPeriodYupSchema = yup
  .object({
    start_date: yup.string().typeError('Start Date is required').isValidDateString().required('Start Date is required'),
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
    const { start_date, end_date, start_time, end_time } = value;

    if (start_date === end_date && start_time && end_time) {
      return dayjs(`${start_date} ${start_time}`, 'YYYY-MM-DD HH:mm:ss').isBefore(
        dayjs(`${end_date} ${end_time}`, 'YYYY-MM-DD HH:mm:ss')
      );
    }
    return true;
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
  survey_id: number;
  survey_sample_site_id: number;
  method_technique_id: number;
  sample_periods: ISurveySampleMethodPeriodData[];
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

      // Remove internal _id property of newly created sample_methods used only as a unique key prop
      console.log(values);

      //   const data: ICreateSamplingPeriodRequest = {
      //     ...otherValues,
      //     sample_methods: sample_methods.map((method) => ({
      //       survey_sample_method_id: method.survey_sample_method_id,
      //       survey_sample_site_id: method.survey_sample_site_id,
      //       method_technique_id: method.technique.method_technique_id,
      //       description: method.description,
      //       sample_periods: method.sample_periods,
      //       method_response_metric_id: method.method_response_metric_id
      //     }))
      //   };

      //   await biohubApi.samplingSite.createSamplingPeriods(surveyContext.projectId, surveyContext.surveyId, data);

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
          survey_id: surveyContext.surveyId,
          survey_sample_site_id: '' as unknown as number,
          method_technique_id: '' as unknown as number,
          sample_periods: [SurveySampleMethodPeriodArrayItemInitialValues]
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
