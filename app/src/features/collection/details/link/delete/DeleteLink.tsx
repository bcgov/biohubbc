import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';

const dialogContext = useDialogContext();
  const biohubApi = useBiohubApi();


export const deleteLinkText = {
  deleteTitle: 'Delete Link',
  deleteText: 'Are you sure you want to delete this link? This action cannot be undone',
  yesButtonLabel: 'Delete',
  noButtonLabel: 'Cancel'
};

export const handleDeleteLink = async (linkId: number) => {
  try {
    await biohubApi.collection.endCollectionLink(collectionId, linkId);
    collectionLinksDataLoader.refresh(paginationSort);
  } catch (error) {
    console.error('Error ending collection link:', error);
  }
};

export const deleteLinkDialog = (linkId: number) => {
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
      await handleDeleteLink(linkId);
      dialogContext.setYesNoDialog({ open: false });
    }
  });
};
