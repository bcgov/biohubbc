import AttachmentsList from 'components/attachments/list/AttachmentsList';
import ProjectReportAttachmentDialog from 'components/dialog/attachments/project/ProjectReportAttachmentDialog';
import { AttachmentType } from 'constants/attachments';
import { AttachmentsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';

export interface IAttachmentsListProps {
  projectId: number;
  attachmentsList: IGetProjectAttachment[];
  getAttachments: (forceFetch: boolean) => Promise<IGetProjectAttachment[] | undefined>;
}

const ProjectAttachmentsList: React.FC<IAttachmentsListProps> = (props) => {
  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const [currentAttachment, setCurrentAttachment] = useState<IGetProjectAttachment | null>(null);

  const handleDownload = async (attachment: IGetProjectAttachment) => {
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
      // SHow error dialog
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

  const handleViewDetails = (attachment: IGetProjectAttachment) => {
    setCurrentAttachment(attachment);
  };

  const handleDelete = (attachment: IGetProjectAttachment) => {
    dialogContext.setYesNoDialog({
      open: true,
      dialogTitle: 'Delete Document',
      dialogText: 'Are you sure you want to delete the selected document? This action cannot be undone.',
      yesButtonProps: { color: 'secondary' },
      onYes: async () => {
        try {
          // Delete attachment
          await biohubApi.project.deleteProjectAttachment(props.projectId, attachment.id, attachment.fileType);

          // Refresh attachments list
          props.getAttachments(true);
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

  return (
    <>
      <ProjectReportAttachmentDialog
        projectId={props.projectId}
        attachment={currentAttachment}
        open={!!currentAttachment && currentAttachment.fileType === AttachmentType.REPORT}
        onClose={() => setCurrentAttachment(null)}
      />
      <AttachmentsList<IGetProjectAttachment>
        attachments={props.attachmentsList}
        handleDownload={handleDownload}
        handleDelete={handleDelete}
        handleViewDetails={handleViewDetails}
      />
    </>
  );
};

export default ProjectAttachmentsList;
