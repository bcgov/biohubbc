import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { AlertI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IAlertUpdateObject } from 'interfaces/useAlertApi.interface';
import { useContext, useState } from 'react';
import yup from 'utils/YupSchema';
import AlertForm from '../form/AlertForm';

interface IEditAlertProps {
  alertId: number;
  open: boolean;
  onClose: (refresh?: boolean) => void;
}

/**
 * Dialog containing the alert form for editing an existing system alert
 * 
 */
const EditAlert = (props: IEditAlertProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useContext(DialogContext);

  const biohubApi = useBiohubApi();

  const alertDataLoader = useDataLoader(() => biohubApi.alert.getAlertById(props.alertId));
  alertDataLoader.load();

  // This is placed inside the `EditAlert` component to make use of an API call to check for used names
  // The API call would violate the rules of react hooks if placed in an object outside of the component
  // Reference: https://react.dev/warnings/invalid-hook-call-warning
  const AlertYupSchema = yup.object().shape({
    name: yup.string().trim().max(50, 'Name cannot exceed 50 characters').required('Name is required'),
    message: yup.string().max(250, 'Description cannot exceed 250 characters').required('Description is required'),
    record_end_date: yup.string().isValidDateString().nullable()
  });

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };
  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: AlertI18N.updateErrorTitle,
      dialogText: AlertI18N.updateErrorText,
      onClose: () => dialogContext.setErrorDialog({ open: false }),
      onOk: () => dialogContext.setErrorDialog({ open: false }),
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmitFundingService = async (values: IAlertUpdateObject) => {
    try {
      setIsSubmitting(true);

      await biohubApi.alert.updateAlert(values);

      // creation was a success, tell parent to refresh
      props.onClose(true);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              Funding source '<strong>{values.name}</strong>' saved
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

  if (!alertDataLoader.isReady || !alertDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <EditDialog
      dialogTitle={AlertI18N.updateAlertDialogTitle}
      open={props.open}
      dialogLoading={isSubmitting}
      size="md"
      component={{
        element: <AlertForm />,
        initialValues: {
          alert_id: alertDataLoader.data.alert_id,
          name: alertDataLoader.data.name,
          message: alertDataLoader.data.message,
          alert_type_id: alertDataLoader.data.alert_type_id,
          severity: alertDataLoader.data.severity,
          data: alertDataLoader.data.data,
          record_end_date: alertDataLoader.data.record_end_date
        },
        validationSchema: AlertYupSchema
      }}
      dialogSaveButtonLabel="Save"
      onCancel={() => props.onClose()}
      onSave={(formValues) => {
        handleSubmitFundingService(formValues);
      }}
    />
  );
};

export default EditAlert;
