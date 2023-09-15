import EditDialog from 'components/dialog/EditDialog';
import yup from 'utils/YupSchema';
import BlockForm from './BlockForm';
interface ICreateSamplingSiteMethodProps {
  open: boolean;
  onSave: (data: any) => void;
  onClose: () => void;
}

const SamplingSiteMethodYupSchema = yup.object({
  method: yup.string(),
  description: yup.string(),
  time_periods: yup.array(
    yup.object({
      start_date: yup.date(),
      end_date: yup.date()
    })
  )
});

const CreateSamplingSiteMethodDialog: React.FC<ICreateSamplingSiteMethodProps> = (props) => {
  const { open, onSave, onClose } = props;
  return (
    <>
      <EditDialog
        dialogTitle={'Add Sampling Method'}
        open={open}
        dialogLoading={false}
        component={{
          element: <BlockForm />,
          initialValues: {},
          validationSchema: SamplingSiteMethodYupSchema
        }}
        dialogSaveButtonLabel="Add"
        onCancel={() => onClose()}
        onSave={(formValues) => {
          onSave(formValues);
        }}
      />
    </>
  );
};

export default CreateSamplingSiteMethodDialog;
