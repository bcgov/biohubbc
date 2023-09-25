import EditDialog from 'components/dialog/EditDialog';
import { useState } from 'react';
import MethodForm, {
  ISurveySampleMethodData,
  SamplingSiteMethodYupSchema,
  SurveySampleMethodDataInitialValues
} from './MethodForm';

interface ISamplingMethodProps {
  open: boolean;
  onSubmit: (data: ISurveySampleMethodData) => void;
  onClose: () => void;
}

const CreateSamplingMethod: React.FC<ISamplingMethodProps> = (props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (values: ISurveySampleMethodData) => {
    setIsSubmitting(false);
    props.onSubmit(values);
  };

  return (
    <>
      <EditDialog
        dialogTitle={'Add Sampling Method'}
        open={props.open}
        dialogLoading={isSubmitting}
        component={{
          element: <MethodForm />,
          initialValues: SurveySampleMethodDataInitialValues,
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
