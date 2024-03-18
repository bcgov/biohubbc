import EditDialog from 'components/dialog/EditDialog';
import MethodForm, {
  IEditSurveySampleMethodData,
  ISurveySampleMethodData,
  SamplingSiteMethodYupSchema,
  SurveySampleMethodDataInitialValues
} from './MethodForm';

interface IEditSamplingMethodProps {
  open: boolean;
  initialData?: IEditSurveySampleMethodData;
  onSubmit: (data: ISurveySampleMethodData, index?: number) => void;
  onClose: () => void;
}

const EditSamplingMethod: React.FC<IEditSamplingMethodProps> = (props) => {
  const { open, initialData, onSubmit, onClose } = props;

  return (
    <>
      <EditDialog
        dialogTitle={'Edit Sampling Method'}
        open={open}
        dialogLoading={false}
        component={{
          element: <MethodForm />,
          initialValues: initialData || SurveySampleMethodDataInitialValues,
          validationSchema: SamplingSiteMethodYupSchema
        }}
        dialogSaveButtonLabel="Update"
        onCancel={onClose}
        onSave={(formValues) => {
          onSubmit(formValues, initialData?.index);
        }}
      />
    </>
  );
};

export default EditSamplingMethod;
