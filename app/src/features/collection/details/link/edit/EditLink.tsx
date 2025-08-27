import { ISnackbarProps } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import { ICollectionLink } from 'interfaces/useCollectionApi.interface';
import { useState } from 'react';
import CollectionLinkDialog from '../dialog/CollectionLinkDialog';
import { ICollectionLinkFormData } from '../dialog/form/CollectionLinkForm';

export function useEditLinkDialog(collectionId: number, refreshCallback: () => void) {
  const biohubApi = useBiohubApi();
  const dialogContext = useDialogContext();
  const [open, setOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ICollectionLink | null>(null);

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const handleEditLink = async (formData: ICollectionLinkFormData) => {
    if (!editingLink) {
      return;
    }
    try {
      await biohubApi.collection.updateCollectionLink(collectionId, editingLink.collection_link_id, {
        name: formData.name,
        description: formData.description === null ? undefined : formData.description,
        url: formData.url
      });
      refreshCallback();
      setOpen(false);
      setEditingLink(null);
      showSnackBar({
        snackbarMessage: 'Link updated successfully',
        open: true
      });
    } catch (_err) {
      showSnackBar({
        snackbarMessage: 'Error updating link',
        open: true
      });
    }
  };

  const openDialog = (link: ICollectionLink) => {
    setEditingLink(link);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditingLink(null);
  };

  const EditLinkDialog = (
    <CollectionLinkDialog
      collectionId={collectionId}
      link={editingLink}
      open={open}
      onSubmit={() => {
        refreshCallback();
        setOpen(false);
        setEditingLink(null);
      }}
      onClose={closeDialog}
      onSave={handleEditLink}
    />
  );

  return { openDialog, closeDialog, EditLinkDialog };
}
