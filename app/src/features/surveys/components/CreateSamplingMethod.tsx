import EditDialog from 'components/dialog/EditDialog';
import { useState } from 'react';
import yup from 'utils/YupSchema';
import MethodForm, { ISamplingMethodData } from './MethodForm';

interface ISamplingMethodProps {
  open: boolean;
  onSubmit: (data: ISamplingMethodData) => void;
  onClose: () => void;
}

const SamplingSiteMethodYupSchema = yup.object({
  method: yup.string(),
  description: yup.string(),
  time_periods: yup.array(
    yup.object({
      start_date: yup.string().isValidDateString().required(),
      end_date: yup.string().isValidDateString().isEndDateSameOrAfterStartDate('start_date').required()
    })
  )
});

const CreateSamplingMethod: React.FC<ISamplingMethodProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (values: any) => {
    setIsSubmitting(true);

    setIsSubmitting(false);
  };

  return (
    <>
      <EditDialog
        dialogTitle={'Add Sampling Method'}
        dialogText={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat. Donec placerat nisl magna, et faucibus arcu condimentum sed.'
        }
        open={props.open}
        dialogLoading={isSubmitting}
        component={{
          element: <MethodForm />,
          initialValues: {
            sample_method_id: null,
            method_lookup_id: null,
            description: '',
            periods: []
          },
          validationSchema: SamplingSiteMethodYupSchema
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

export default CreateSamplingMethod;
