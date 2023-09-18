import EditDialog from 'components/dialog/EditDialog';
import { useState } from 'react';
import yup from 'utils/YupSchema';
import MethodForm from './MethodForm';

interface ISamplingMethodYupSchemaProps {
  open: boolean;
  onClose: () => void;
}

const SamplingMethodYupSchema = yup.object().shape({});
const CreateSamplingMethod: React.FC<ISamplingMethodYupSchemaProps> = (props) => {
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
          validationSchema: SamplingMethodYupSchema
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
