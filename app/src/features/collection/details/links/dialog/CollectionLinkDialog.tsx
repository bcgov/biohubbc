import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { FormikProps } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import {
  ICollectionLink,
  ICreateCollectionLinkRequest,
  IUpdateCollectionLinkRequest
} from 'interfaces/useCollectionApi.interface';
import { ReactNode, useState } from 'react';
import CollectionLinkForm, { ICollectionLinkFormData } from './form/CollectionLinkForm';

interface ICollectionLinkDialogProps {
  collectionId: number;
  link?: ICollectionLink | null;
  onSubmit: () => void;
  onClose: () => void;
  open: boolean;
}

/**
 * Dialog for creating or editing collection links
 */
const CollectionLinkDialog = (props: ICollectionLinkDialogProps) => {
  const { collectionId, link, onSubmit, onClose, open } = props;

  const biohubApi = useBiohubApi();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = Boolean(link);

  const handleSubmit = async (formData: ICollectionLinkFormData) => {
    setIsLoading(true);

    try {
      if (isEditing && link) {
        const updateData: IUpdateCollectionLinkRequest = {
          id: link.id,
          name: formData.name,
          description: formData.description,
          url: formData.url
        };
        await biohubApi.collection.updateCollectionLink(collectionId, updateData);
      } else {
        const createData: ICreateCollectionLinkRequest = {
          name: formData.name,
          description: formData.description,
          url: formData.url
        };
        await biohubApi.collection.createCollectionLink(collectionId, createData);
      }

      onSubmit();
    } catch (error) {
      console.error('Error saving collection link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose} aria-labelledby="collection-link-dialog-title">
      <DialogTitle id="collection-link-dialog-title">
        {isEditing ? 'Edit External Resource' : 'Add External Resource'}
      </DialogTitle>

      <DialogContent>
        <CollectionLinkForm
          initialValues={{
            name: link?.name ?? '',
            description: link?.description ?? '',
            url: link?.url ?? ''
          }}
          onSubmit={handleSubmit}
          renderForm={(formikProps: FormikProps<ICollectionLinkFormData> & { children: ReactNode }) => (
            <>
              {formikProps.children}
              <DialogActions>
                <Button onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <LoadingButton type="submit" variant="contained" loading={isLoading} onClick={formikProps.submitForm}>
                  {isEditing ? 'Update' : 'Create'}
                </LoadingButton>
              </DialogActions>
            </>
          )}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CollectionLinkDialog;
