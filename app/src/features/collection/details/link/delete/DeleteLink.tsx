import { Typography } from '@mui/material';
import { ISnackbarProps } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';

export const deleteLinkText = {
  deleteTitle: 'Delete Link',
  deleteText: 'Are you sure you want to delete this link? This action cannot be undone',
  yesButtonLabel: 'Delete',
  noButtonLabel: 'Cancel'
};

// Custom hook to provide the delete link dialog logic
export function useDeleteLinkDialog() {
  const biohubApi = useBiohubApi();
  const dialogContext = useDialogContext();
  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const handleDeleteLink = async (collectionId: number, linkId: number, refreshCallback: () => void) => {
    try {
      await biohubApi.collection.endCollectionLink(collectionId, linkId);
      refreshCallback();
      showSnackBar({
        snackbarMessage: (
          <Typography variant="body2" component="span">
            Link deleted succesfully
          </Typography>
        ),
        open: true
      });
    } catch (error) {
      console.error('Error ending collection link:', error);
      showSnackBar({
        snackbarMessage: (
          <Typography variant="body2" component="span">
            Error deleting link
          </Typography>
        ),
        open: true
      });
    }
  };

  const deleteLinkDialog = (collectionId: number, linkId: number, refreshCallback: () => void) => {
    dialogContext.setYesNoDialog({
      dialogTitle: deleteLinkText.deleteTitle,
      dialogText: deleteLinkText.deleteText,
      yesButtonLabel: deleteLinkText.yesButtonLabel,
      noButtonLabel: deleteLinkText.noButtonLabel,
      yesButtonProps: { color: 'error' },
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      open: true,
      onYes: async () => {
        await handleDeleteLink(collectionId, linkId, refreshCallback);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  return { deleteLinkDialog };
}
