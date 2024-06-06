import EditDialog from 'components/dialog/EditDialog';
import PeriodForm from './PeriodForm';
import {
  ISurveySampleMethodPeriodData,
  SamplingSiteMethodPeriodYupSchema,
  SurveySampleMethodPeriodArrayItemInitialValues
} from './SamplingPeriodForm';

interface ISamplingPeriodProps {
  open: boolean;
  onSubmit: (data: ISurveySampleMethodPeriodData) => void;
  onClose: () => void;
}

/**
 * Returns a form for creating a sampling Period
 *
 * @returns
 */
const CreateSamplingPeriod = (props: ISamplingPeriodProps) => {
  const handleSubmit = (values: ISurveySampleMethodPeriodData) => {
    props.onSubmit(values);
  };

  return (
    <>
      <EditDialog
        dialogTitle={'Add Sampling Period'}
        open={props.open}
        dialogLoading={false}
        component={{
          element: <PeriodForm />,
          initialValues: SurveySampleMethodPeriodArrayItemInitialValues,
          validationSchema: SamplingSiteMethodPeriodYupSchema
        }}
        dialogSaveButtonLabel="Add"
        onCancel={() => props.onClose()}
        onSave={(formValues) => {
          handleSubmit(formValues);
        }}
      />
    </>
  );
};

export default CreateSamplingPeriod;
