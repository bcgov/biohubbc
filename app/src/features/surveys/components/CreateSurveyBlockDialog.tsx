import EditDialog from 'components/dialog/EditDialog';
import BlockForm from './BlockForm';
import { BlockYupSchema } from './SurveyBlockSection';

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
        dialogText={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat. Donec placerat nisl magna, et faucibus arcu condimentum sed.'
        }
        open={open}
        dialogLoading={false}
        component={{
          element: <BlockForm />,
          initialValues: {
            survey_block_id: null,
            name: '',
            description: ''
          },
          validationSchema: BlockYupSchema
        }}
        dialogSaveButtonLabel="Add Block"
        onCancel={() => onClose()}
        onSave={(formValues) => onSave(formValues)}
      />
    </>
  );
};

export default CreateSurveyBlockDialog;
