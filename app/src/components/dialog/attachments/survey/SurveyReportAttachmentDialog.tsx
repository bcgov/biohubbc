import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import { AttachmentsI18N } from 'constants/i18n';
import { defaultErrorDialogProps, DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { default as React, useContext, useEffect } from 'react';
import { getFormattedFileSize } from 'utils/Utils';
import { AttachmentType } from '../../../../constants/attachments';
import { IErrorDialogProps } from '../../ErrorDialog';
import ReportAttachmentDetails from '../ReportAttachmentDetails';

export interface ISurveyReportAttachmentDialogProps {
  projectId: number;
  surveyId: number;
  attachment: IGetSurveyAttachment | null;
  open: boolean;
  onClose: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const SurveyReportAttachmentDialog: React.FC<ISurveyReportAttachmentDialogProps> = (props) => {
  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const attachmentId = props.attachment?.id;

  const reportAttachmentDetailsDataLoader = useDataLoader((_attachmentId: number) =>
    biohubApi.survey.getSurveyReportDetails(props.projectId, props.surveyId, _attachmentId)
  );

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
  };

  const openAttachment = async (attachment: IGetSurveyAttachment) => {
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
      if (reportAttachmentDetailsDataLoader.data.metadata.survey_report_attachment_id) {
        await biohubApi.survey.updateSurveyReportMetadata(
          props.projectId,
          props.surveyId,
          reportAttachmentDetailsDataLoader.data.metadata.survey_report_attachment_id,
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

  useEffect(() => {
    // Load attachment details if attachmentId exists or has changed
    if (!attachmentId) {
      return;
    }

    reportAttachmentDetailsDataLoader.refresh(attachmentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachmentId]);

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

export default SurveyReportAttachmentDialog;
