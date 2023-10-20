import AttachmentsList from 'components/attachments/list/AttachmentsList';
import SurveyReportAttachmentDialog from 'components/dialog/attachments/survey/SurveyReportAttachmentDialog';
import RemoveOrResubmitDialog from 'components/publish/components/RemoveOrResubmitDialog';
import { PublishStatus } from 'constants/attachments';
import { AttachmentsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useEffect, useState } from 'react';

const SurveyAttachmentsList: React.FC = () => {
  const biohubApi = useBiohubApi();

  const surveyContext = useContext(SurveyContext);
  const dialogContext = useContext(DialogContext);

  const [currentAttachment, setCurrentAttachment] = useState<null | IGetSurveyAttachment>(null);
  const [removeOrResubmitDialogOpen, setRemoveOrResubmitDialogOpen] = useState<boolean>(false);
  const [viewReportDetailsDialogOpen, setViewReportDetailsDialogOpen] = useState<boolean>(false);

  // Load survey attachments
  useEffect(() => {
    surveyContext.artifactDataLoader.load(surveyContext.projectId, surveyContext.surveyId);
  }, [surveyContext.artifactDataLoader, surveyContext.projectId, surveyContext.surveyId]);

  const handleDownload = async (attachment: IGetSurveyAttachment) => {
    try {
      const response = await biohubApi.survey.getSurveyAttachmentSignedURL(
        surveyContext.projectId,
        surveyContext.surveyId,
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

  const handleViewDetails = (attachment: IGetSurveyAttachment) => {
    setCurrentAttachment(attachment);
    setViewReportDetailsDialogOpen(true);
  };

  const handleRemoveOrResubmit = (attachment: IGetSurveyAttachment) => {
    setCurrentAttachment(attachment);
    setRemoveOrResubmitDialogOpen(true);
  };

  const handleDelete = (attachment: IGetSurveyAttachment) => {
    dialogContext.setYesNoDialog({
      open: true,
      dialogTitle: 'Delete document?',
      dialogText: 'Are you sure you want to delete this document? This action cannot be undone.',
      yesButtonProps: { color: 'error' },
      yesButtonLabel: 'Delete',
      noButtonLabel: 'Cancel',
      onYes: async () => {
        try {
          // Delete attachment
          await biohubApi.survey.deleteSurveyAttachment(
            surveyContext.projectId,
            surveyContext.surveyId,
            attachment.id,
            attachment.fileType
          );

          // Refresh attachments list
          surveyContext.artifactDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
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
      <RemoveOrResubmitDialog
        projectId={surveyContext.projectId}
        fileName={currentAttachment?.fileName ?? ''}
        parentName={surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name ?? ''}
        status={
          currentAttachment?.supplementaryAttachmentData?.event_timestamp
            ? PublishStatus.SUBMITTED
            : PublishStatus.UNSUBMITTED
        }
        submittedDate={currentAttachment?.supplementaryAttachmentData?.event_timestamp ?? ''}
        open={removeOrResubmitDialogOpen}
        onClose={() => setRemoveOrResubmitDialogOpen(false)}
      />
      <SurveyReportAttachmentDialog
        projectId={surveyContext.projectId}
        surveyId={surveyContext.surveyId}
        attachment={currentAttachment}
        open={viewReportDetailsDialogOpen}
        onClose={() => setViewReportDetailsDialogOpen(false)}
      />
      <AttachmentsList<IGetSurveyAttachment>
        attachments={[
          ...(surveyContext.artifactDataLoader.data?.attachmentsList || []),
          ...(surveyContext.artifactDataLoader.data?.reportAttachmentsList || [])
        ]}
        handleDownload={handleDownload}
        handleDelete={handleDelete}
        handleViewDetails={handleViewDetails}
        handleRemoveOrResubmit={handleRemoveOrResubmit}
      />
    </>
  );
};

export default SurveyAttachmentsList;
