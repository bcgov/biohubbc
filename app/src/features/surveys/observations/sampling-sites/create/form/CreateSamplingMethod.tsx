import EditDialog from 'components/dialog/EditDialog';
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

/**
 * Returns a form for creating a sampling method
 *
 * @returns
 */
const CreateSamplingMethod = (props: ISamplingMethodProps) => {
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
