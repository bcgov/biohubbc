import { Typography } from '@mui/material';
import AttachmentsList from 'components/attachments/list/AttachmentsList';
import ProjectReportAttachmentDialog from 'components/dialog/attachments/project/ProjectReportAttachmentDialog';
import RemoveOrResubmitDialog from 'components/publish/components/RemoveOrResubmitDialog';
import { AttachmentType, PublishStatus } from 'constants/attachments';
import { AttachmentsI18N } from 'constants/i18n';
import { DialogContext, ISnackbarProps } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { useContext, useMemo, useState } from 'react';

const ProjectAttachmentsList = () => {
  const biohubApi = useBiohubApi();

  const projectContext = useContext(ProjectContext);

  const dialogContext = useContext(DialogContext);

  const [currentAttachment, setCurrentAttachment] = useState<IGetProjectAttachment | null>(null);
  const [removeOrResubmitDialogOpen, setRemoveOrResubmitDialogOpen] = useState<boolean>(false);

  const showSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const handleDownload = async (attachment: IGetProjectAttachment) => {
    try {
      const response = await biohubApi.project.getAttachmentSignedURL(
        projectContext.projectId,
        attachment.id,
        attachment.fileType
      );

      if (!response) {
        return;
      }

      window.open(response);
    } catch (error) {
      const apiError = error as APIError;
      // Show error dialog
      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: AttachmentsI18N.downloadErrorTitle,
        dialogText: AttachmentsI18N.downloadErrorText,
        dialogErrorDetails: apiError.errors,
        onOk: () => dialogContext.setErrorDialog({ open: false }),
        onClose: () => dialogContext.setErrorDialog({ open: false })
      });
    }
  };

  const handleViewDetailsOpen = (attachment: IGetProjectAttachment) => {
    setCurrentAttachment(attachment);
  };

  const handleViewDetailsClose = () => {
    setCurrentAttachment(null);
  };

  const handleRemoveOrResubmit = (attachment: IGetProjectAttachment) => {
    setCurrentAttachment(attachment);
    setRemoveOrResubmitDialogOpen(true);
  };

  const handleDelete = (attachment: IGetProjectAttachment) => {
    dialogContext.setYesNoDialog({
      open: true,
      dialogTitle: 'Delete Document?',
      dialogText: 'Are you sure you want to permanently delete this document? This action cannot be undone.',
      yesButtonProps: { color: 'error' },
      yesButtonLabel: 'Delete',
      noButtonLabel: 'Cancel',
      onYes: async () => {
        try {
          // Delete attachment
          await biohubApi.project.deleteProjectAttachment(projectContext.projectId, attachment.id, attachment.fileType);

          // Refresh attachments list
          projectContext.artifactDataLoader.refresh(projectContext.projectId);

          showSnackBar({
            snackbarMessage: (
              <>
                <Typography variant="body2" component="div">
                  Attachment: <strong>{attachment.fileName}</strong> removed from application.
                </Typography>
              </>
            ),
            open: true
          });
        } catch (error) {
          const apiError = error as APIError;
          // Show error dialog
          dialogContext.setErrorDialog({
            open: true,
            dialogTitle: AttachmentsI18N.deleteErrorTitle,
            dialogText: AttachmentsI18N.deleteErrorText,
            dialogErrorDetails: apiError.errors,
            onOk: () => dialogContext.setErrorDialog({ open: false }),
            onClose: () => dialogContext.setErrorDialog({ open: false })
          });
        } finally {
          // Close delete dialog
          dialogContext.setYesNoDialog({ open: false });
        }
      },
      onNo: () => dialogContext.setYesNoDialog({ open: false }),
      onClose: () => dialogContext.setYesNoDialog({ open: false })
    });
  };

  const attachmentsList = useMemo(() => {
    return [
      ...(projectContext.artifactDataLoader.data?.attachmentsList || []),
      ...(projectContext.artifactDataLoader.data?.reportAttachmentsList || [])
    ];
  }, [projectContext.artifactDataLoader.data]);

  return (
    <>
      <RemoveOrResubmitDialog
        projectId={projectContext.projectId}
        fileName={currentAttachment?.fileName ?? ''}
        parentName={projectContext.projectDataLoader.data?.projectData.project.project_name ?? ''}
        status={
          currentAttachment?.supplementaryAttachmentData?.event_timestamp
            ? PublishStatus.SUBMITTED
            : PublishStatus.UNSUBMITTED
        }
        submittedDate={currentAttachment?.supplementaryAttachmentData?.event_timestamp ?? ''}
        open={removeOrResubmitDialogOpen}
        onClose={() => setRemoveOrResubmitDialogOpen(false)}
      />
      <ProjectReportAttachmentDialog
        projectId={projectContext.projectId}
        attachment={currentAttachment}
        open={!!currentAttachment && currentAttachment?.fileType === AttachmentType.REPORT}
        onClose={handleViewDetailsClose}
      />
      <AttachmentsList<IGetProjectAttachment>
        attachments={attachmentsList}
        handleDownload={handleDownload}
        handleDelete={handleDelete}
        handleViewDetails={handleViewDetailsOpen}
        handleRemoveOrResubmit={handleRemoveOrResubmit}
        emptyStateText="No Shared Files"
      />
    </>
  );
};

export default ProjectAttachmentsList;
