import Typography from '@mui/material/Typography';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { AlertI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useEffect } from 'react';

interface IDeleteAlert {
  alertId: number;
  open: boolean;
  onClose: (refresh?: boolean) => void;
  openViewModal: (alertId: number) => void;
}

const DeleteAlert: React.FC<IDeleteAlert> = (props) => {
  const { alertId, open, onClose } = props;
  const dialogContext = useContext(DialogContext);
  const biohubApi = useBiohubApi();

  const alertDataLoader = useDataLoader(() => biohubApi.alert.getAlertById(alertId));

  useEffect(() => {
    alertDataLoader.load(), [];
  });

  // API Error dialog
  const showDeleteErrorDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: AlertI18N.deleteAlertErrorTitle,
      dialogText: AlertI18N.deleteAlertErrorText,
      open: true,
      onYes: async () => dialogContext.setYesNoDialog({ open: false }),
      onClose: () => dialogContext.setYesNoDialog({ open: false })
    });
  };

  // Success snack bar
  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const deleteAlert = async () => {
    try {
      await biohubApi.alert.deleteAlert(alertId);
      // delete was a success, tell parent to refresh
      onClose(true);

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              Alert deleted
            </Typography>
          </>
        ),
        open: true
      });
    } catch (error) {
      // error deleting, show dialog that says you need to remove references
      onClose(false);
      showDeleteErrorDialog();
    }
  };

  if (!alertDataLoader.isReady || !alertDataLoader.data) {
    return <></>;
  }

  return (
    <YesNoDialog
      dialogTitle={AlertI18N.deleteAlertDialogTitle}
      dialogText={AlertI18N.deleteAlertDialogText}
      yesButtonProps={{ color: 'error' }}
      yesButtonLabel={'Delete'}
      noButtonProps={{ color: 'primary', variant: 'outlined' }}
      noButtonLabel={'Cancel'}
      open={open}
      onYes={() => {
        deleteAlert();
      }}
      onClose={() => {}}
      onNo={() => onClose()}
    />
  );
};

export default DeleteAlert;
