import EditDialog from 'components/dialog/EditDialog';
import BlockForm from './BlockForm';
import { BlockEditYupSchema, IPostSurveyBlock } from './SurveyBlockForm';

interface IEditBlockProps {
  open: boolean;
  initialData?: IPostSurveyBlock;
  onSave: (data: any, index?: number) => void;
  onClose: () => void;
}

const EditSurveyBlockDialog: React.FC<IEditBlockProps> = (props) => {
  const { open, initialData, onSave, onClose } = props;
  return (
    <EditDialog
      dialogTitle={'Edit Block Details'}
      open={open}
      dialogLoading={false}
      component={{
        element: <BlockForm />,
        initialValues: {
          survey_block_id: initialData?.block.survey_block_id || null,
          name: initialData?.block.name || '',
          description: initialData?.block.description || '',
          geojson: initialData?.block.geojson || '',
          sample_block_count: initialData?.block.sample_block_count
        },
        validationSchema: BlockEditYupSchema
      }}
      dialogSaveButtonLabel="Save"
      onCancel={() => {
        onClose();
      }}
      onSave={(formValues) => {
        onSave(formValues, initialData?.index);
      }}
    />
  );
};

export default EditSurveyBlockDialog;
