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
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { default as React, useContext, useState } from 'react';
import { getFormattedFileSize } from 'utils/Utils';
import { AttachmentType } from '../../../../../constants/attachments';
import { IErrorDialogProps } from '../../../ErrorDialog';
import SecurityDialog from '../../SecurityDialog';
import AttachmentDetails from './../attachment/AttachmentDetails';

export interface IProjectAttachmentDialogProps {
  projectId: number;
  attachmentId: number | undefined;
  currentAttachment: IGetProjectAttachment | null;
  open: boolean;
  onClose: () => void;
  refresh: (id: number, type: string) => void;
  dialogProps?: DialogProps;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const ProjectAttachmentDialog: React.FC<IProjectAttachmentDialogProps> = (props) => {
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);

  const [showAddSecurityDialog, setShowAddSecurityDialog] = useState(false);

  const attachmentDetailsDataLoader = useDataLoader((attachmentId: number) =>
    biohubApi.project.getProjectAttachmentDetails(props.projectId, attachmentId)
  );

  const addSecurityReasons = async (securityReasons: number[]) => {
    if (props.attachmentId) {
      const attachmentData: IAttachmentType = {
        id: props.attachmentId,
        type: AttachmentType.OTHER
      };

      await biohubApi.security.addProjectSecurityReasons(props.projectId, securityReasons, [attachmentData]);

      refreshAttachmentDetails();

      setShowAddSecurityDialog(false);
    }
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
  };

  const openAttachment = async (attachment: IGetProjectAttachment) => {
    try {
      const response = await biohubApi.project.getAttachmentSignedURL(
        props.projectId,
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

export default ProjectAttachmentDialog;
