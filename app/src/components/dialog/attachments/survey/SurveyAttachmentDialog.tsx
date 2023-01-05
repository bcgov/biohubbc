import { DialogTitle } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import { AttachmentsI18N } from 'constants/i18n';
import { defaultErrorDialogProps, DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { default as React, useContext } from 'react';
import { getFormattedFileSize } from 'utils/Utils';
import { IErrorDialogProps } from '../../ErrorDialog';
import AttachmentDetails from '../project/attachment/AttachmentDetails';

export interface ISurveyAttachmentDialogProps {
  projectId: number;
  surveyId: number;
  attachmentId: number | undefined;
  currentAttachment: IGetSurveyAttachment | null;
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
const SurveyAttachmentDialog: React.FC<ISurveyAttachmentDialogProps> = (props) => {
  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const attachmentDetailsDataLoader = useDataLoader((attachmentId: number) =>
    biohubApi.survey.getSurveyAttachmentDetails(props.projectId, props.surveyId, attachmentId)
  );

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

  if (!props.open) {
    return <></>;
  }

  return (
    <>
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

export default SurveyAttachmentDialog;
