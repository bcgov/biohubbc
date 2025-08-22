import EditDialog from 'components/dialog/EditDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import {
  ICollectionLink,
  ICreateCollectionLinkRequest,
  IUpdateCollectionLinkRequest
} from 'interfaces/useCollectionApi.interface';
import { useState } from 'react';
import yup from 'utils/YupSchema';
import CollectionLinkForm, { ICollectionLinkFormData } from './form/CollectionLinkForm';

interface ICollectionLinkDialogProps {
  collectionId: number;
  link?: ICollectionLink | null;
  onSubmit: () => void;
  onClose: () => void;
  open: boolean;
}

const CollectionLinkDialog = (props: ICollectionLinkDialogProps) => {
  const { collectionId, link, onSubmit, onClose, open } = props;

  const biohubApi = useBiohubApi();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const isEditing = Boolean(link);

  const validationSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    url: yup.string().url('Invalid URL').required('URL is required'),
    description: yup.string()
  });

  const initialValues: ICollectionLinkFormData = {
    name: link?.name ?? '',
    description: link?.description ?? '',
    url: link?.url ?? ''
  };

  const handleSave = async (formData: ICollectionLinkFormData) => {
    setIsLoading(true);
    setError(undefined);

    try {
      if (isEditing && link) {
        const updateData: IUpdateCollectionLinkRequest = {
          name: formData.name,
          description: formData.description,
          url: formData.url
        };
        await biohubApi.collection.updateCollectionLink(collectionId, link.collection_link_id, updateData);
      } else {
        const createData: ICreateCollectionLinkRequest = {
          name: formData.name,
          description: formData.description,
          url: formData.url
        };
        await biohubApi.collection.createCollectionLink(collectionId, createData);
      }
      onSubmit();
    } catch (error: any) {
      setError('Error saving collection link');
      console.error('Error saving collection link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EditDialog<ICollectionLinkFormData>
      dialogTitle={isEditing ? 'Edit External Resource' : 'Add External Resource'}
      open={open}
      size="sm"
      dialogLoading={isLoading}
      dialogError={error}
      component={{
        element: <CollectionLinkForm />,
        initialValues,
        validationSchema: validationSchema
      }}
      dialogSaveButtonLabel={isEditing ? 'Update' : 'Create'}
      onCancel={onClose}
      onSave={handleSave}
    />
  );
};

export default CollectionLinkDialog;
