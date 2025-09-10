import { ISnackbarProps } from 'contexts/dialogContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import { useState } from 'react';
import CollectionLinkDialog from '../dialog/CollectionLinkDialog';
import { ICollectionLinkFormData } from '../dialog/form/CollectionLinkForm';

export function useCreateLinkDialog(collectionId: number, refreshCallback: () => void) {
  const biohubApi = useBiohubApi();
  const dialogContext = useDialogContext();
  const [open, setOpen] = useState(false);
  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const handleCreateLink = async (formData: ICollectionLinkFormData) => {
    try {
      // Convert null description to undefined for API compatibility
      const apiData = {
        name: formData.name,
        description: formData.description ?? undefined,
        url: formData.url
      };
      await biohubApi.collection.createCollectionLink(collectionId, apiData);
      refreshCallback();
      setOpen(false);
      showSnackBar({
        snackbarMessage: 'Link created successfully',
        open: true
      });
    } catch (err: any) {
      showSnackBar({
        snackbarMessage: `Error creating link${err?.message ? `: ${err.message}` : ''}`,
        open: true
      });
    }
  };

  const openDialog = () => {
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
  };

  const CreateLinkDialog = (
    <CollectionLinkDialog
      collectionId={collectionId}
      link={null}
      open={open}
      onSubmit={() => {
        refreshCallback();
        setOpen(false);
      }}
      onClose={closeDialog}
      onSave={handleCreateLink}
    />
  );

  return { openDialog, closeDialog, CreateLinkDialog };
}
