import EditDialog from 'components/dialog/EditDialog';
import {
  ISurveySampleMethodPeriodData,
  SamplePeriodPeriodForm,
  SurveySampleMethodPeriodArrayItemInitialValues
} from 'features/surveys/sampling-information/periods/form/sites/periods/SamplePeriodPeriodForm';
import { SamplingSiteMethodPeriodYupSchema } from '../../create/CreateSamplePeriodPage';

interface ICreateSamplingPeriodFormDialogProps {
  open: boolean;
  onSubmit: (data: ISurveySampleMethodPeriodData) => void;
  onClose: () => void;
}

/**
 * Returns a form for creating a sampling Period
 *
 * @returns {*}
 */
export const CreateSamplingPeriodFormDialog = (props: ICreateSamplingPeriodFormDialogProps) => {
  const handleSubmit = (values: ISurveySampleMethodPeriodData) => {
    props.onSubmit(values);
  };

  return (
    <EditDialog
      dialogTitle={'Add Sampling Period'}
      open={props.open}
      dialogLoading={false}
      component={{
        element: <SamplePeriodPeriodForm />,
        initialValues: SurveySampleMethodPeriodArrayItemInitialValues,
        validationSchema: SamplingSiteMethodPeriodYupSchema
      }}
      dialogSaveButtonLabel="Add"
      onCancel={() => props.onClose()}
      onSave={(formValues) => {
        handleSubmit(formValues);
      }}
    />
  );
};
