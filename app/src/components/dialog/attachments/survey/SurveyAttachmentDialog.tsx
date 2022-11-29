import { DialogTitle } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import { AttachmentsI18N } from 'constants/i18n';
import { defaultErrorDialogProps, DialogContext } from 'contexts/dialogContext';
import { IAttachmentType } from 'features/projects/view/ProjectAttachments';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetProjectAttachment, IGetSecurityReasons } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { default as React, useContext, useState } from 'react';
import { getFormattedFileSize } from 'utils/Utils';
import { AttachmentType } from '../../../../constants/attachments';
import { IErrorDialogProps } from '../../ErrorDialog';
import AttachmentDetails from '../project/attachment/AttachmentDetails';
import AttachmentSecurityTable from '../project/attachment/AttachmentSecurityTable';
import SecurityDialog from '../SecurityDialog';

export interface ISurveyAttachmentDialogProps {
  projectId: number;
  surveyId: number;
  attachmentId: number | undefined;
  currentAttachment: IGetSurveyAttachment | null;
  open: boolean;
  onClose: () => void;
  refresh: (id: number) => void;
  dialogProps?: DialogProps;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const SurveyAttachmentDialog: React.FC<ISurveyAttachmentDialogProps> = (props) => {
  const biohubApi = useBiohubApi();

  const [showAddSecurityDialog, setShowAddSecurityDialog] = useState(false);

  const dialogContext = useContext(DialogContext);

  const attachmentDetailsDataLoader = useDataLoader((attachmentId: number) =>
    biohubApi.survey.getSurveyAttachmentDetails(props.projectId, props.surveyId, attachmentId)
  );

  const defaultYesNoDialogProps = {
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const addSecurityReasons = async (securityReasons: number[]) => {
    if (props.attachmentId) {
      const attachmentData: IAttachmentType = {
        id: props.attachmentId,
        type: AttachmentType.OTHER
      };

      await biohubApi.security.addSurveySecurityReasons(props.projectId, props.surveyId, securityReasons, [
        attachmentData
      ]);

      setShowAddSecurityDialog(false);
    }
  };

  const removeSecurity = async (securityReasons: IGetSecurityReasons[]) => {
    const securityIds = securityReasons.map((security) => {
      return security.security_reason_id;
    });

    if (props.attachmentId) {
      await biohubApi.security.deleteSurveyAttachmentSecurityReasons(
        props.projectId,
        props.surveyId,
        props.attachmentId,
        securityIds
      );
    }
  };

  const showDeleteSecurityReasonDialog = (securityReasons: IGetSecurityReasons[]) => {
    let yesNoDialogProps;

    if (securityReasons.length === 1) {
      yesNoDialogProps = {
        ...defaultYesNoDialogProps,
        dialogTitle: 'Remove Security Reason',
        dialogText: 'Are you sure you want to remove the selected security reason? This action cannot be undone.'
      };
    } else {
      yesNoDialogProps = {
        ...defaultYesNoDialogProps,
        dialogTitle: 'Remove Security Reasons',
        dialogText: 'Are you sure you want to remove all security reasons? This action cannot be undone.'
      };
    }

    dialogContext.setYesNoDialog({
      ...yesNoDialogProps,
      open: true,
      yesButtonProps: { color: 'secondary' },
      onYes: async () => {
        await removeSecurity(securityReasons);

        await updateReviewTime();
        if (props.attachmentId) {
          await props.refresh(props.attachmentId);
        }

        await refreshAttachmentDetails();

        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
  };

  const openAttachment = async (attachment: IGetProjectAttachment) => {
    try {
      const response = await biohubApi.survey.getSurveyAttachmentSignedURL(
        props.projectId,
        props.surveyId,
        attachment.id,
        attachment.fileType
      );

      if (!response) {
        return;
      }

      window.open(response);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({
        dialogTitle: AttachmentsI18N.downloadErrorTitle,
        dialogText: AttachmentsI18N.downloadErrorText,
        dialogErrorDetails: apiError.errors,
        open: true
      });
      return;
    }
  };

  const openAttachmentFromReportMetaDialog = async () => {
    if (props.currentAttachment) {
      openAttachment(props.currentAttachment);
    }
  };

  // Initial load of attachment details
  if (props.currentAttachment) {
    attachmentDetailsDataLoader.load(props.currentAttachment.id);
  }

  const refreshAttachmentDetails = () => {
    if (props.currentAttachment) {
      attachmentDetailsDataLoader.refresh(props.currentAttachment.id);
    }
  };

  const updateReviewTime = async () => {
    try {
      if (props.attachmentId) {
        await biohubApi.security.updateSurveyAttachmentSecurityReviewTime(props.projectId, props.attachmentId);
      }
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
    }
  };

  if (!props.open) {
    return <></>;
  }

  return (
    <>
      <SecurityDialog
        open={showAddSecurityDialog}
        selectedSecurityRules={attachmentDetailsDataLoader.data?.security_reasons || []}
        onAccept={async (securityReasons) => {
          // formik form is retuning array of strings not numbers
          // linter believes formik to be number[] so wrapped map in string to force values into number[]
          if (securityReasons.security_reasons.length > 0) {
            await addSecurityReasons(
              securityReasons.security_reasons.map((item) => parseInt(`${item.security_reason_id}`))
            );
          }

          refreshAttachmentDetails();

          setShowAddSecurityDialog(false);
        }}
        onClose={() => setShowAddSecurityDialog(false)}
      />

      <Dialog open={props.open} onClose={props.onClose} {...props.dialogProps} data-testid="view-meta-dialog">
        <DialogTitle data-testid="view-meta-dialog-title">
          <Typography variant="body2" color="textSecondary" style={{ fontWeight: 700 }}>
            VIEW DOCUMENT DETAILS
          </Typography>
        </DialogTitle>
        <DialogContent>
          <AttachmentDetails
            title={props.currentAttachment?.fileName || ''}
            attachmentSize={(props.currentAttachment && getFormattedFileSize(props.currentAttachment.size)) || '0 KB'}
            onFileDownload={openAttachmentFromReportMetaDialog}
          />

          <AttachmentSecurityTable
            securityDetails={attachmentDetailsDataLoader.data || null}
            showAddSecurityDialog={setShowAddSecurityDialog}
            showDeleteSecurityReasonDialog={showDeleteSecurityReasonDialog}
            isAwaitingReview={!props.currentAttachment?.securityReviewTimestamp}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SurveyAttachmentDialog;
