import EditDialog from 'components/dialog/EditDialog';
import BlockForm from './BlockForm';
import { BlockCreateYupSchema } from './SurveyBlockForm';
interface ICreateBlockProps {
  open: boolean;
  onSave: (data: any) => void;
  onClose: () => void;
}

const CreateSurveyBlockDialog: React.FC<ICreateBlockProps> = (props) => {
  const { open, onSave, onClose } = props;
  return (
    <>
      <EditDialog
        dialogTitle={'Add Block'}
        open={open}
        dialogLoading={false}
        component={{
          element: <BlockForm />,
          initialValues: {
            survey_block_id: null,
            name: '',
            description: '',
            sample_block_count: 0
          },
          validationSchema: BlockCreateYupSchema
        }}
        dialogSaveButtonLabel="Add Block"
        onCancel={() => onClose()}
        onSave={(formValues) => {
          onSave(formValues);
        }}
      />
    </>
  );
};

export default CreateSurveyBlockDialog;
