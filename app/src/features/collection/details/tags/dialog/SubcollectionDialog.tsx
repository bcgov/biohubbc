import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateSubcollectionI18N } from 'constants/i18n';
import { ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import { ICollection, ICreateCollectionRequest } from 'interfaces/useCollectionApi.interface';
import { useState } from 'react';
import yup from 'utils/YupSchema';
import { SubcollectionForm } from './form/SubcollectionForm';

interface ISubcollectionDialogProps {
  collection: ICollection;
  open: boolean;
  onSubmit: () => void;
  onClose?: (refresh?: boolean) => void;
}

/**
 * Dialog for inviting collection participants
 *
 * @param {ISubcollectionDialogProps} props
 * @returns
 */
const SubcollectionDialog = (props: ISubcollectionDialogProps) => {
  const { collection } = props;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useDialogContext();

  const biohubApi = useBiohubApi();

  const SubcollectionYupSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    description: yup.string().max(3000, 'Description cannot exceed 3000 characters.').nullable(),
    participants: yup.array(yup.object({ system_user_id: yup.number(), collection_role_name: yup.string() }))
  });

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateSubcollectionI18N.createErrorTitle,
      dialogText: CreateSubcollectionI18N.createErrorText,
      onClose: () => dialogContext.setErrorDialog({ open: false }),
      onOk: () => dialogContext.setErrorDialog({ open: false }),
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmitCollectionService = async (values: ICreateCollectionRequest) => {
    setIsSubmitting(true);

    try {
      await biohubApi.collection.createSubcollection(collection.collection_id, {
        ...values,
        participants: values.participants.map((participant) => ({
          system_user_id: participant.system_user_id,
          collection_role_name: participant.collection_role_name
        }))
      });

      props.onSubmit();

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="span">
              Created Subproject
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
      dialogTitle="Create Subproject"
      dialogText="Enter a name for the subproject and optionally add members"
      open={props.open}
      dialogLoading={isSubmitting}
      component={{
        element: <SubcollectionForm collection={collection} />,
        initialValues: {
          name: '',
          description: '',
          participants: []
        },
        validationSchema: SubcollectionYupSchema
      }}
      dialogSaveButtonLabel="Add"
      onCancel={() => props.onClose && props.onClose()}
      onSave={(formValues) => {
        handleSubmitCollectionService(formValues);
      }}
    />
  );
};

export default SubcollectionDialog;
