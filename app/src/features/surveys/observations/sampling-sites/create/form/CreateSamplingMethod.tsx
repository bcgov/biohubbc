import EditDialog from 'components/dialog/EditDialog';
import MethodForm, {
  ISurveySampleMethodData,
  SamplingSiteMethodYupSchema,
  SurveySampleMethodDataInitialValues
} from './MethodCreateForm';

interface ISamplingMethodProps {
  open: boolean;
  onSubmit: (data: ISurveySampleMethodData) => void;
  onClose: () => void;
}

const CreateSamplingMethod: React.FC<ISamplingMethodProps> = (props) => {
  const handleSubmit = (values: ISurveySampleMethodData) => {
    props.onSubmit(values);
  };

  return (
    <>
      <EditDialog
        dialogTitle={'Add Sampling Method'}
        open={props.open}
        dialogLoading={false}
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
