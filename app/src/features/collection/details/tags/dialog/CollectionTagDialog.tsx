import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateCollectionTagI18N } from 'constants/i18n';
import { ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { ICreateCollectionRequest } from 'interfaces/useCollectionApi.interface';
import { useEffect, useState } from 'react';
import { pluralize } from 'utils/Utils';
import yup from 'utils/YupSchema';
import { CollectionTagForm } from './form/CollectionTagForm';

interface ICollectionTagDialogProps {
  collectionId: number;
  open: boolean;
  onSubmit: () => void;
  onClose?: (refresh?: boolean) => void;
}

/**
 * Dialog for inviting collection participants
 *
 * @param {ICollectionTagDialogProps} props
 * @returns
 */
const CollectionTagDialog = (props: ICollectionTagDialogProps) => {
  const { collectionId } = props;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useDialogContext();

  const biohubApi = useBiohubApi();

  const membersDataLoader = useDataLoader(() => biohubApi.collection.getParticipants(collectionId));

  useEffect(() => {
    membersDataLoader.load();
  }, [membersDataLoader]);

  const CollectionTagYupSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    description: yup.string().max(3000, 'Description cannot exceed 3000 characters.').nullable(),
    participants: yup
      .array(yup.object({ system_user_id: yup.number(), collection_role_name: yup.string() }))
      .min(1, 'There must be at least one participant')
  });

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateCollectionTagI18N.createErrorTitle,
      dialogText: CreateCollectionTagI18N.createErrorText,
      onClose: () => dialogContext.setErrorDialog({ open: false }),
      onOk: () => dialogContext.setErrorDialog({ open: false }),
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmitCollectionService = async (values: ICreateCollectionRequest) => {
    try {
      setIsSubmitting(true);

      await biohubApi.collection.createCollection(values);

      props.onSubmit();

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="span">
              Added {values.participants.length} {pluralize(values.participants.length, 'user')} to collection
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
    }
    setIsSubmitting(false);
  };

  return (
    <EditDialog
      dialogTitle="Create Tag"
      dialogText="Enter a name for the tag and manage access to surveys with the tag"
      open={props.open}
      dialogLoading={isSubmitting}
      component={{
        element: <CollectionTagForm members={membersDataLoader.data?.participants ?? []} />,
        initialValues: {
          parent_collection_id: props.collectionId,
          name: '',
          description: '',
          participants: []
        },
        validationSchema: CollectionTagYupSchema
      }}
      dialogSaveButtonLabel="Add"
      onCancel={() => props.onClose && props.onClose()}
      onSave={(formValues) => {
        handleSubmitCollectionService(formValues);
      }}
    />
  );
};

export default CollectionTagDialog;
