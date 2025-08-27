import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';

export const deleteLinkText = {
  deleteTitle: 'Delete Link',
  deleteText: 'Are you sure you want to delete this link? This action cannot be undone',
  yesButtonLabel: 'Delete',
  noButtonLabel: 'Cancel'
};

const biohubApi = useBiohubApi();

export const handleDeleteLink = async (collectionId: number, linkId: number, refreshCallback: () => void) => {
  useBiohubApi();
  try {
    await biohubApi.collection.endCollectionLink(collectionId, linkId);
    refreshCallback();
  } catch (error) {
    console.error('Error ending collection link:', error);
  }
};

export const deleteLinkDialog = (collectionId: number, linkId: number, refreshCallback: () => void) => {
  const dialogContext = useDialogContext();
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
