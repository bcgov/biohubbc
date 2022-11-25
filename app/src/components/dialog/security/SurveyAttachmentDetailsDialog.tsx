import { DialogTitle } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import { IEditReportMetaForm } from 'components/attachments/EditReportMetaForm';
import { AttachmentsI18N } from 'constants/i18n';
import { defaultErrorDialogProps, DialogContext } from 'contexts/dialogContext';
import { IAttachmentType } from 'features/projects/view/ProjectAttachments';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import {
  IGetAttachmentDetails,
  IGetProjectAttachment,
  IGetReportDetails,
  IGetSecurityReasons
} from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import { default as React, useContext, useEffect, useState } from 'react';
import { getFormattedFileSize } from 'utils/Utils';
import { AttachmentType } from '../../../constants/attachments';
import { IErrorDialogProps } from '../ErrorDialog';
import AttachmentDetails from './AttachmentDetails';
import ReportAttachmentDetails from './ReportAttachmentDetails';
import SecurityDialog from './SecurityDialog';
import ViewSecurityTable from './ViewSecurityTable';

export interface ISurveyAttachmentDetailsDialogProps {
  projectId: number;
  surveyId: number;
  attachmentId: number | undefined;
  currentAttachment: IGetSurveyAttachment | null;
  open: boolean;
  onClose: () => void;
  dialogProps?: DialogProps;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const SurveyAttachmentDetailsDialog: React.FC<ISurveyAttachmentDetailsDialogProps> = (props) => {
  const biohubApi = useBiohubApi();

  const [reportDetails, setReportDetails] = useState<IGetReportDetails | null>(null);
  const [attachmentDetails, setAttachmentDetails] = useState<IGetAttachmentDetails | null>(null);
  const [showAddSecurityDialog, setShowAddSecurityDialog] = useState(false);

  const dialogContext = useContext(DialogContext);

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
        type: mapFileTypeToAttachmentType((props.currentAttachment && props.currentAttachment.fileType) || 'Other')
      };

      await biohubApi.security.addSurveySecurityReasons(props.projectId, props.surveyId, securityReasons, [
        attachmentData
      ]);

      setShowAddSecurityDialog(false);
    }
  };

  const mapFileTypeToAttachmentType = (type: string): AttachmentType => {
    let attachmentType = AttachmentType.OTHER;
    if (type === 'Report') {
      attachmentType = AttachmentType.REPORT;
    }

    return attachmentType;
  };

  const removeSecurity = async (securityReasons: IGetSecurityReasons[]) => {
    const securityIds = securityReasons.map((security) => {
      return security.security_reason_id;
    });

    if (props.attachmentId) {
      if (props.currentAttachment && props.currentAttachment.fileType === AttachmentType.REPORT) {
        await biohubApi.security.deleteSurveyReportAttachmentSecurityReasons(
          props.projectId,
          props.surveyId,
          props.attachmentId,
          securityIds
        );
      } else {
        await biohubApi.security.deleteSurveyAttachmentSecurityReasons(
          props.projectId,
          props.surveyId,
          props.attachmentId,
          securityIds
        );
      }
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
        loadDetails();
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

  const handleDialogEditSave = async (values: IEditReportMetaForm) => {
    if (!reportDetails || !reportDetails.metadata) {
      return;
    }

    const fileMeta = values;

    try {
      await biohubApi.survey.updateSurveyReportMetadata(
        props.projectId,
        props.surveyId,
        reportDetails.metadata.id,
        AttachmentType.REPORT,
        fileMeta,
        reportDetails.metadata.revision_count
      );
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
    }
  };

  const getReportDetails = async (attachment: IGetProjectAttachment) => {
    try {
      const response = await biohubApi.survey.getSurveyReportDetails(props.projectId, props.surveyId, attachment.id);

      if (!response) {
        return;
      }

      setReportDetails(response);
    } catch (error) {
      return error;
    }
  };

  const getAttachmentDetails = async (attachment: IGetProjectAttachment) => {
    try {
      const response = await biohubApi.survey.getSurveyAttachmentDetails(
        props.projectId,
        props.surveyId,
        attachment.id
      );

      if (!response) {
        return;
      }

      setAttachmentDetails(response);
    } catch (error) {
      return error;
    }
  };

  const loadDetails = useCallback(() => {
    if (props.currentAttachment) {
      if (props.currentAttachment?.fileType === 'Report') {
        getReportDetails(props.currentAttachment);
        setAttachmentDetails(null);
      } else {
        getAttachmentDetails(props.currentAttachment);
        setReportDetails(null);
      }
    }
  });

  useEffect(() => {
    loadDetails();
  }, [props.open, props.currentAttachment, loadDetails]);

  if (!props.open) {
    return <></>;
  }

  return (
    <>
      <SecurityDialog
        open={showAddSecurityDialog}
        selectedSecurityRules={reportDetails?.security_reasons || attachmentDetails?.security_reasons || []}
        onAccept={async (securityReasons) => {
          // formik form is retuning array of strings not numbers if printed out in console
          // linter wrongly believes formik to be number[] so wrapped map in string to force values into number[]
          if (securityReasons.security_reasons.length > 0) {
            await addSecurityReasons(
              securityReasons.security_reasons.map((item) => parseInt(`${item.security_reason_id}`))
            );
          }

          loadDetails();
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
          {reportDetails && (
            <ReportAttachmentDetails
              title={reportDetails?.metadata?.title || ''}
              onFileDownload={openAttachmentFromReportMetaDialog}
              onSave={handleDialogEditSave}
              securityDetails={reportDetails}
              attachmentSize={(props.currentAttachment && getFormattedFileSize(props.currentAttachment.size)) || '0 KB'}
              refresh={loadDetails}
            />
          )}

          {!reportDetails && (
            <AttachmentDetails
              title={props.currentAttachment?.fileName || ''}
              attachmentSize={(props.currentAttachment && getFormattedFileSize(props.currentAttachment.size)) || '0 KB'}
              onFileDownload={openAttachmentFromReportMetaDialog}
            />
          )}

          <ViewSecurityTable
            updateReviewTime={() => {}}
            securityDetails={reportDetails || attachmentDetails}
            showAddSecurityDialog={setShowAddSecurityDialog}
            showDeleteSecurityReasonDialog={showDeleteSecurityReasonDialog}
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

export default SurveyAttachmentDetailsDialog;
