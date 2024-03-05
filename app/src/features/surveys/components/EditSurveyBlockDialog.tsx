import EditDialog from 'components/dialog/EditDialog';
import BlockForm from './BlockForm';
import { BlockYupSchema, ISurveyBlock } from './SurveyBlockForm';

interface IEditBlockProps {
  open: boolean;
  initialData?: ISurveyBlock;
  onSave: (data: any, index?: number) => void;
  onClose: () => void;
}

const EditSurveyBlockDialog: React.FC<IEditBlockProps> = (props) => {
  const { open, initialData, onSave, onClose } = props;
  return (
    <>
      <EditDialog
        dialogTitle={'Edit Block Details'}
        open={open}
        dialogLoading={false}
        component={{
          element: <BlockForm />,
          initialValues: {
            survey_block_id: initialData?.block.survey_block_id || null,
            name: initialData?.block.name || '',
            description: initialData?.block.description || ''
          },
          validationSchema: BlockYupSchema
        }}
        dialogSaveButtonLabel="Save"
        onCancel={() => {
          onClose();
        }}
        onSave={(formValues) => {
          onSave(formValues, initialData?.index);
        }}
      />
    </>
  );
};

export default EditSurveyBlockDialog;
