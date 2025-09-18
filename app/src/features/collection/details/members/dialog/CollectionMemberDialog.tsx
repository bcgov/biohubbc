import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateCollectionSurveyI18N } from 'constants/i18n';
import { ISnackbarProps } from 'contexts/dialogContext';
import { CollectionMembersForm } from 'features/collection/edit/members/CollectionMembersForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext } from 'hooks/useContext';
import { ICollectionMember } from 'interfaces/useCollectionApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { useState } from 'react';
import { pluralize } from 'utils/Utils';
import yup from 'utils/YupSchema';

export interface ICollectionMemberData {
  members: (ISystemUser & ICollectionMember)[];
}
interface ICollectionMemberDialogProps {
  collectionId: number;
  open: boolean;
  onSubmit: () => void;
  onClose?: (refresh?: boolean) => void;
}

/**
 * Dialog for inviting collection members
 *
 * NOTE: On naming conventions, CollectionMemberForm is from the perspective of a survey (adding one survey to multiple collections).
 * Whereas CollectionSurveyForm is from the perspective of a collection (adding multiple surveys to one collection)
 *
 * @param {ICollectionMemberDialogProps} props
 * @returns
 */
const CollectionMemberDialog = (props: ICollectionMemberDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useDialogContext();
  const codesContext = useCodesContext();

  const biohubApi = useBiohubApi();

  const CollectionSurveyYupSchema = yup.object().shape({
    members: yup
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

  const handleSubmitCollectionService = async (values: ICollectionMemberData) => {
    try {
      setIsSubmitting(true);

      await biohubApi.collection.addMembers(
        props.collectionId,
        values.members.map((member) => ({
          system_user_id: member.system_user_id,
          collection_role_name: member.collection_role_name
        }))
      );

      props.onSubmit();

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="span">
              Added {values.members.length} {pluralize(values.members.length, 'user')} to collection
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
      dialogTitle="Add members"
      dialogText="Select users to add them to the collection and assign them a role."
      open={props.open}
      dialogLoading={isSubmitting}
      component={{
        element: <CollectionMembersForm roles={codesContext.codesDataLoader.data?.collection_roles ?? []} />,
        initialValues: {
          members: []
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

export default CollectionMemberDialog;
