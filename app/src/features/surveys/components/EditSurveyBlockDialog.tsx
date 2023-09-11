import CloseIcon from '@mui/icons-material/Close';
import { Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import EditDialog from 'components/dialog/EditDialog';
import { useState } from 'react';
import BlockForm from './BlockForm';
import { BlockYupSchema, IEditBlock } from './SurveyBlockSection';

interface IEditBlockProps {
  open: boolean;
  initialData?: IEditBlock;
  onSave: (data: any, index?: number) => void;
  onClose: () => void;
}

const EditSurveyBlockDialog: React.FC<IEditBlockProps> = (props) => {
  const { open, initialData, onSave, onClose } = props;
  const [isSnackBarOpen, setIsSnackBarOpen] = useState(false);
  const [blockName, setBlockName] = useState('');
  return (
    <>
      <EditDialog
        dialogTitle={'Edit Block'}
        dialogText={
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat. Donec placerat nisl magna, et faucibus arcu condimentum sed.'
        }
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
          setBlockName('');
          setIsSnackBarOpen(true);
          onClose();
        }}
        onSave={(formValues) => {
          setBlockName(formValues.name);
          setIsSnackBarOpen(true);
          onSave(formValues, initialData?.index);
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
              {initialData?.block.survey_block_id ? (
                <>
                  Block <strong>{blockName}</strong> has been updated.
                </>
              ) : (
                <>
                  Block <strong>{blockName}</strong> has been added.
                </>
              )}
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

export default EditSurveyBlockDialog;
