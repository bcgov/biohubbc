import AttachmentsList from 'components/attachments/list/AttachmentsList';
import ProjectReportAttachmentDialog from 'components/dialog/attachments/project/ProjectReportAttachmentDialog';
import { AttachmentType } from 'constants/attachments';
import { AttachmentsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import React, { useContext, useMemo, useState } from 'react';

const ProjectAttachmentsList = () => {
  const biohubApi = useBiohubApi();

  const projectContext = useContext(ProjectContext);

  const dialogContext = useContext(DialogContext);

  const [currentAttachment, setCurrentAttachment] = useState<IGetProjectAttachment | null>(null);

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
      // SHow error dialog
      dialogContext.showErrorDialog({
        dialogTitle: AttachmentsI18N.downloadErrorTitle,
        dialogText: AttachmentsI18N.downloadErrorText,
        dialogErrorDetails: apiError.errors,
        onOk: () => dialogContext.hideDialog(),
        onClose: () => dialogContext.hideDialog()
      });
    }
  };

  const handleViewDetailsOpen = (attachment: IGetProjectAttachment) => {
    setCurrentAttachment(attachment);
  };

  const handleViewDetailsClose = () => {
    setCurrentAttachment(null);
  };

  const handleDelete = (attachment: IGetProjectAttachment) => {
    dialogContext.showYesNoDialog({
      dialogTitle: 'Delete Document?',
      dialogText: 'Are you sure you want to permanently delete this document? This action cannot be undone.',
      yesButtonProps: { color: 'secondary' },
      onYes: async () => {
        try {
          // Delete attachment
          await biohubApi.project.deleteProjectAttachment(projectContext.projectId, attachment.id, attachment.fileType);

          // Refresh attachments list
          projectContext.artifactDataLoader.refresh(projectContext.projectId);
        } catch (error) {
          const apiError = error as APIError;
          // Show error dialog
          dialogContext.showErrorDialog({
            dialogTitle: AttachmentsI18N.deleteErrorTitle,
            dialogText: AttachmentsI18N.deleteErrorText,
            dialogErrorDetails: apiError.errors,
            onOk: () => dialogContext.hideDialog(),
            onClose: () => dialogContext.hideDialog()
          });
        } finally {
          // Close delete dialog
          dialogContext.hideDialog();
        }
      },
      onNo: () => dialogContext.hideDialog(),
      onClose: () => dialogContext.hideDialog()
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
      />
    </>
  );
};

export default ProjectAttachmentsList;
