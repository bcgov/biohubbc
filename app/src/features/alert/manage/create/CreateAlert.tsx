import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { AlertI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IAlertCreateObject } from 'interfaces/useAlertApi.interface';
import { useContext, useState } from 'react';
import yup from 'utils/YupSchema';
import AlertForm from '../form/AlertForm';

const AlertYupSchema = yup.object().shape({
  name: yup.string().trim().max(50, 'Name cannot exceed 50 characters').required('Name is required'),
  message: yup.string().max(250, 'Description cannot exceed 250 characters').required('Description is required'),
  record_end_date: yup.string().isValidDateString().nullable()
});

interface ICreateAlertProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
}

const CreateAlert = (props: ICreateAlertProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useContext(DialogContext);

  const biohubApi = useBiohubApi();

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };
  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: AlertI18N.createErrorTitle,
      dialogText: AlertI18N.createErrorText,
      onClose: () => dialogContext.setErrorDialog({ open: false }),
      onOk: () => dialogContext.setErrorDialog({ open: false }),
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmitAlert = async (values: IAlertCreateObject) => {
    try {
      setIsSubmitting(true);

      await biohubApi.alert.createAlert(values);

      // creation was a success, tell parent to refresh
      props.onClose(true);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="span">
              Alert '<strong>{values.name}</strong>' created
            </Typography>
          </>
        ),
        open: true
      });
    } catch (error: any) {
      showCreateErrorDialog({
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError).errors
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <EditDialog
        dialogTitle={AlertI18N.createAlertDialogTitle}
        dialogText={AlertI18N.createAlertDialogText}
        open={props.open}
        dialogLoading={isSubmitting}
        component={{
          element: <AlertForm />,
          initialValues: {
            name: '',
            message: '',
            type: '',
            data: null,
            record_end_date: null
          },
          validationSchema: AlertYupSchema
        }}
        dialogSaveButtonLabel="Create"
        onCancel={() => props.onClose()}
        onSave={(formValues) => {
          handleSubmitAlert(formValues);
        }}
      />
    </>
  );
};

export default CreateAlert;
