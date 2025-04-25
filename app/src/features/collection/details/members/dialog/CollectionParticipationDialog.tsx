import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateCollectionSurveyI18N } from 'constants/i18n';
import { ISnackbarProps } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext } from 'hooks/useContext';
import { useState } from 'react';
import { pluralize } from 'utils/Utils';
import yup from 'utils/YupSchema';
import CollectionParticipationForm, { ICollectionParticipationData } from './form/CollectionParticipationForm';

interface ICollectionParticipationDialogProps {
  collectionId: number;
  open: boolean;
  onSubmit: () => void;
  onClose?: (refresh?: boolean) => void;
}

/**
 * Dialog for inviting collection participants
 *
 * NOTE: On naming conventions, CollectionParticipationForm is from the perspective of a survey (adding one survey to multiple collections).
 * Whereas CollectionSurveyForm is from the perspective of a collection (adding multiple surveys to one collection)
 *
 * @param {ICollectionParticipationDialogProps} props
 * @returns
 */
const CollectionParticipationDialog = (props: ICollectionParticipationDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useDialogContext();
  const codesContext = useCodesContext();

  const biohubApi = useBiohubApi();

  const CollectionSurveyYupSchema = yup.object().shape({
    participants: yup
      .array(
        yup.object({
          system_user_id: yup.number().required('You must select a person'),
          collection_role_name: yup.string().required('You must select a role')
        })
      )
      .min(1, 'You must select at least one person')
  });

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateCollectionSurveyI18N.createErrorTitle,
      dialogText: CreateCollectionSurveyI18N.createErrorText,
      onClose: () => dialogContext.setErrorDialog({ open: false }),
      onOk: () => dialogContext.setErrorDialog({ open: false }),
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmitCollectionService = async (values: ICollectionParticipationData) => {
    try {
      setIsSubmitting(true);

      await biohubApi.collection.addParticipants(
        props.collectionId,
        values.participants.map((participant) => ({
          system_user_id: participant.system_user_id,
          collection_role_name: participant.collection_role_name
        }))
      );

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
      dialogTitle="Invite members"
      dialogText="Select users to invite to the collection"
      open={props.open}
      dialogLoading={isSubmitting}
      component={{
        element: <CollectionParticipationForm roles={codesContext.codesDataLoader.data?.collection_roles ?? []} />,
        initialValues: {
          participants: []
        },
        validationSchema: CollectionSurveyYupSchema
      }}
      dialogSaveButtonLabel="Add"
      onCancel={() => props.onClose && props.onClose()}
      onSave={(formValues) => {
        handleSubmitCollectionService(formValues);
      }}
    />
  );
};

export default CollectionParticipationDialog;
