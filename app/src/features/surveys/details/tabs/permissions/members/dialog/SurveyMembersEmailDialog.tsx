import Typography from '@mui/material/Typography';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateCollectionSurveyI18N } from 'constants/i18n';
import { ISnackbarProps } from 'contexts/dialogContext';
import {
  SurveyMembersEmailsForm,
  SurveyMembersEmailYupSchema,
  SurveyMembersFormInitialValues
} from 'features/surveys/components/member/SurveyMembersEmailsForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext } from 'hooks/useContext';
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
  const codesContext = useCodesContext();

  const biohubApi = useBiohubApi();

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

  const handleSubmitCollectionService = async (values: any) => {
    try {
      setIsSubmitting(true);

      //TECH DEBT: UPDATE API ENDPOINT
      console.log('Email members to invite:', values.members);

      props.onSubmit();

      showSnackBar({
        snackbarMessage: (
          <>
            <Typography variant="body2" component="span">
              Would invite {values.members.length} {pluralize(values.members.length, 'user')} to survey
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
        handleSubmitCollectionService(formValues);
      }}
    />
  );
};

export default SurveyMemberEmailDialog;
