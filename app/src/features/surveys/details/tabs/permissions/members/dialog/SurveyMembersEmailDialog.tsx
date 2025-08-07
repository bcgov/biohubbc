import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { CreateCollectionSurveyI18N } from 'constants/i18n';
import { SURVEY_ROLE } from 'constants/roles';
import { ISnackbarProps } from 'contexts/dialogContext';
import {
  SurveyMembersEmailsForm,
  SurveyMembersEmailYupSchema,
  SurveyMembersFormInitialValues
} from 'features/surveys/components/member/SurveyMembersEmailsForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext } from 'hooks/useContext';
import { IPostSurveyMember } from 'interfaces/useSurveyApi.interface';
import { useState } from 'react';
import { pluralize } from 'utils/Utils';

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
  const biohubApi = useBiohubApi();
  const codesContext = useCodesContext();

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

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      const createdUsers: IPostSurveyMember[] = [];

      // Step 1: Create system users for each email
      for (const member of values.members) {
        try {
          const response = await biohubApi.admin.addSystemUser(
            member.email, // user identifier, using email as placeholder until we get name from keycloak
            SYSTEM_IDENTITY_SOURCE.UNVERIFIED, // unverified source until keycloak confirms
            member.email, // email as display name until keycloak overwrites it
            member.email, // email
            2 // roleId (assign them a creator role)
          );

          createdUsers.push({
            system_user_id: response.system_user_id,
            survey_role_name: member.survey_role_name as SURVEY_ROLE // Cast to SURVEY_ROLE enum
          });

          // Step 1.5: Create an "Invited" administrative activity record for the user
          try {
            await biohubApi.admin.createInvitedAccessRequest(response.system_user_id, {
              email: member.email,
              userGuid: '', // Will be populated when user actually logs in
              name: member.email, // Using email as name placeholder
              username: member.email, // Using email as username placeholder
              identitySource: SYSTEM_IDENTITY_SOURCE.UNVERIFIED,
              displayName: member.email,
              reason: 'Invited via email to survey'
            });
          } catch (activityError) {
            console.error(`Failed to create administrative activity for ${member.email}:`, activityError);
            // Continue even if activity creation fails
          }
        } catch (userError) {
          console.error(`Failed to create user for ${member.email}:`, userError);
          // Continue with other users even if one fails
        }
      }

      // Step 2: Add created users to the survey
      if (createdUsers.length > 0) {
        await biohubApi.survey.addSurveyMembers(props.surveyId, createdUsers);
      }

      props.onSubmit();

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="span">
              Successfully invited {createdUsers.length} of {values.members.length}{' '}
              {pluralize(values.members.length, 'user')} to survey
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
        initialValues: SurveyMembersFormInitialValues,
        validationSchema: SurveyMembersEmailYupSchema
      }}
      dialogSaveButtonLabel="Add"
      onCancel={() => props.onClose && props.onClose()}
      onSave={(formValues) => {
        handleSubmit(formValues);
      }}
    />
  );
};

export default SurveyMemberEmailDialog;
