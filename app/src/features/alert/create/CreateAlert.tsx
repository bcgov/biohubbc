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

interface ICreateAlertProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
}

const CreateAlert = (props: ICreateAlertProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useContext(DialogContext);

  const biohubApi = useBiohubApi();

  // This is placed inside the `CreateAlert` component to make use of an API call to check for used names
  // The API call would violate the rules of react hooks if placed in an object outside of the component
  // Reference: https://react.dev/warnings/invalid-hook-call-warning
  const AlertYupSchema = yup.object().shape({
    name: yup
      .string()
      .trim()
      .max(50, 'Name cannot exceed 50 characters')
      .required('Name is required')
      .test('nameUsed', 'Name has already been used', async (val) => {
        let hasBeenUsed = false;
        if (val) {
          const alerts = await biohubApi.alert.getAlerts(val);
          // name matches return true

          alerts.alerts.forEach((item) => {
            if (item.name.toLowerCase() === val.toLowerCase()) {
              hasBeenUsed = true;
            }
          });
        }
        return !hasBeenUsed;
      }),
    description: yup.string().max(250, 'Description cannot exceed 250 characters').required('Description is required'),
    start_date: yup.string().isValidDateString().nullable(),
    end_date: yup.string().isValidDateString().isEndDateSameOrAfterStartDate('start_date').nullable()
  });

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

      await biohubApi.alert.createAlert(values)

      // creation was a success, tell parent to refresh
      props.onClose(true);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="span">
              Funding source '<strong>{values.name}</strong>' created
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
            data: {}
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
