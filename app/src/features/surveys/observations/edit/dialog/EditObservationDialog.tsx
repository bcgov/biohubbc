import Box from '@mui/material/Box';
import { DialogProps } from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { useFormikContext } from 'formik';
import { IObservationTableRowToSave } from 'hooks/api/useObservationApi';
import yup from 'utils/YupSchema';
import AddEditObservationForm from '../../form/ObservationForm';

interface IEditObservationDialogProps extends DialogProps {
  open: boolean;
  onSave: (data: any, index?: number) => void;
  onClose: () => void;
}

export const ObservationYupSchema = yup.object({
  species: yup.number().required('Species is required.')
});

const EditObservationDialog = (props: IEditObservationDialogProps) => {
  const { open, onClose } = props;

  const { values } = useFormikContext<IObservationTableRowToSave>();

  return (
    <>
      <EditDialog
        dialogTitle={'Edit Observation'}
        size="md"
        open={open}
        dialogLoading={false}
        component={{
          element: (
            <>
              <Box mb={3}>
                <Typography color="textSecondary">Enter information about the observation</Typography>
              </Box>
              <Box maxHeight="55vh">
                <AddEditObservationForm />
              </Box>
            </>
          ),
          initialValues: values,
          validationSchema: ObservationYupSchema
        }}
        dialogSaveButtonLabel="Save Changes"
        onCancel={() => {
          onClose();
        }}
        onSave={() => {
          // onSave(formValues, initialData?.index);
        }}
      />
    </>
  );
};

export default EditObservationDialog;
