import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateCollectionSurveyI18N } from 'constants/i18n';
import { ISnackbarProps } from 'contexts/dialogContext';
import { SurveyMembersEmailsForm } from 'features/surveys/components/member/SurveyMembersEmailsForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext } from 'hooks/useContext';
import { ISurveyMemberEmailForm } from 'interfaces/useSurveyApi.interface';
import { useState } from 'react';
import { pluralize } from 'utils/Utils';
import yup from 'utils/YupSchema';

interface ISurveyMemberEmailDialogProps {
  surveyId: number;
  open: boolean;
  onSubmit: () => void;
  onClose?: (refresh?: boolean) => void;
}

/**
 * Dialog for inviting survey members via email
 *
 * NOTE: On naming conventions, SurveyMemberForm is from the perspective of a survey (adding one survey to multiple surveys).
 * Whereas CollectionSurveyForm is from the perspective of a survey (adding multiple surveys to one survey)
 *
 * @param {ISurveyMemberEmailDialogProps} props
 * @returns
 */
const SurveyMemberEmailDialog = (props: ISurveyMemberEmailDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogContext = useDialogContext();
  const codesContext = useCodesContext();

  const biohubApi = useBiohubApi();

  const CollectionSurveyYupSchema = yup.object().shape({
    members: yup
      .array(
        yup.object({
          system_user_id: yup.number().required('You must supply an email address'),
          survey_role_name: yup.string().required('You must select a role')
        })
      )
      .min(1, 'You must supply at least one email address')
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

  const handleSubmitCollectionService = async (values: ISurveyMemberEmailForm) => {
    try {
      setIsSubmitting(true);

      await biohubApi.survey.addSurveyMembers(
        props.surveyId,
        values.members.map((member) => ({
          system_user_id: member.system_user_id,
          survey_role_name: member.survey_role_name
        }))
      );

      props.onSubmit();

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="span">
              Added {values.members.length} {pluralize(values.members.length, 'user')} to survey
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
      dialogTitle="Invite members via email"
      dialogText="Enter the email addresses of the users you would like to invite to this survey."
      open={props.open}
      dialogLoading={isSubmitting}
      component={{
        element: <SurveyMembersEmailsForm roles={codesContext.codesDataLoader.data?.survey_roles ?? []} />,
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

export default SurveyMemberEmailDialog;
