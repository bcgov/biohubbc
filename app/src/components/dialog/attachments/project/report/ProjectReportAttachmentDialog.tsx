import { DialogTitle } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import { AttachmentsI18N } from 'constants/i18n';
import { defaultErrorDialogProps, DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { default as React, useContext } from 'react';
import { getFormattedFileSize } from 'utils/Utils';
import { AttachmentType } from '../../../../../constants/attachments';
import { IErrorDialogProps } from '../../../ErrorDialog';
import ReportAttachmentDetails from './ReportAttachmentDetails';

export interface IProjectReportAttachmentDialogProps {
  projectId: number;
  attachment: IGetProjectAttachment | null;
  open: boolean;
  onClose: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const ProjectReportAttachmentDialog: React.FC<IProjectReportAttachmentDialogProps> = (props) => {
  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const reportAttachmentDetailsDataLoader = useDataLoader((attachmentId: number) =>
    biohubApi.project.getProjectReportDetails(props.projectId, attachmentId)
  );

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
    if (props.attachment) {
      openAttachment(props.attachment);
    }
  };

  const handleDialogEditSave = async (values: IEditReportMetaForm) => {
    if (!reportAttachmentDetailsDataLoader.data || !reportAttachmentDetailsDataLoader.data.metadata) {
      return;
    }

    const fileMeta = values;

    try {
      if (reportAttachmentDetailsDataLoader.data.metadata.project_report_attachment_id) {
        await biohubApi.project.updateProjectReportMetadata(
          props.projectId,
          reportAttachmentDetailsDataLoader.data.metadata.project_report_attachment_id,
          AttachmentType.REPORT,
          fileMeta,
          reportAttachmentDetailsDataLoader.data.metadata.revision_count
        );
      }
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
    }
  };

  // Initial load of attachment details
  if (props.attachment) {
    reportAttachmentDetailsDataLoader.load(props.attachment.id);
  }

  if (!props.open) {
    return <></>;
  }

  return (
    <>
      <Dialog open={props.open} onClose={props.onClose} fullWidth={true} maxWidth="lg" data-testid="view-meta-dialog">
        <DialogTitle data-testid="view-meta-dialog-title">
          <Typography variant="body2" color="textSecondary" style={{ fontWeight: 700 }}>
            VIEW DOCUMENT DETAILS
          </Typography>
        </DialogTitle>
        <DialogContent>
          <ReportAttachmentDetails
            title={reportAttachmentDetailsDataLoader.data?.metadata?.title || ''}
            onFileDownload={openAttachmentFromReportMetaDialog}
            onSave={handleDialogEditSave}
            reportAttachmentDetails={reportAttachmentDetailsDataLoader.data || null}
            attachmentSize={(props.attachment && getFormattedFileSize(props.attachment.size)) || '0 KB'}
            refresh={() => props.attachment?.id && reportAttachmentDetailsDataLoader.refresh(props.attachment.id)}
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

export default ProjectReportAttachmentDialog;
