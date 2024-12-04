import EditDialog from 'components/dialog/EditDialog';
import { SamplingPeriodForm } from 'features/surveys/sampling-information/periods/form/SamplingPeriodForm';
import {
  ISurveySampleMethodPeriodData,
  SamplingSiteMethodPeriodYupSchema,
  SurveySampleMethodPeriodArrayItemInitialValues
} from 'features/surveys/sampling-information/periods/form/SamplingPeriodFormContainer';

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
        element: <SamplingPeriodForm />,
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
