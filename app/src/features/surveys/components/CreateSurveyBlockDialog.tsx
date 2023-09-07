import CloseIcon from '@mui/icons-material/Close';
import { Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import EditDialog from 'components/dialog/EditDialog';
import { useState } from 'react';
import BlockForm from './BlockForm';
import { BlockYupSchema } from './SurveyBlockSection';
interface ICreateBlockProps {
  open: boolean;
  onSave: (data: any) => void;
  onClose: () => void;
}

const CreateSurveyBlockDialog: React.FC<ICreateBlockProps> = (props) => {
  const { open, onSave, onClose } = props;
  const [isSnackBarOpen, setIsSnackBarOpen] = useState(false);
  const [blockName, setBlockName] = useState('');
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
        onSave={(formValues) => {
          setBlockName(formValues.name);
          setIsSnackBarOpen(true);
          onSave(formValues);
        }}
      />

      <Snackbar
        open={isSnackBarOpen}
        autoHideDuration={6000}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        onClose={() => {
          setIsSnackBarOpen(false);
          setBlockName('');
        }}
        message={
          <>
            <Typography variant="body2" component="div">
              Block <strong>{blockName}</strong> has been added.
            </Typography>
          </>
        }
        action={
          <IconButton size="small" aria-label="close" color="inherit" onClick={() => setIsSnackBarOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

export default CreateSurveyBlockDialog;
