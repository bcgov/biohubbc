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
import useDataLoader from 'hooks/useDataLoader';
import { IGetProjectAttachment, IGetSecurityReasons } from 'interfaces/useProjectApi.interface';
import { default as React, useContext, useState } from 'react';
import { getFormattedFileSize } from 'utils/Utils';
import { AttachmentType } from '../../../constants/attachments';
import { IErrorDialogProps } from '../ErrorDialog';
import AttachmentDetails from './AttachmentDetails';
import ReportAttachmentDetails from './ReportAttachmentDetails';
import SecurityDialog from './SecurityDialog';
import ViewSecurityTable from './ViewSecurityTable';

export interface IProjectAttachmentDetailsDialogProps {
  projectId: number;
  attachmentId: number | undefined;
  currentAttachment: IGetProjectAttachment | null;
  open: boolean;
  onClose: () => void;

  dialogProps?: DialogProps;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const ProjectAttachmentDetailsDialog: React.FC<IProjectAttachmentDetailsDialogProps> = (props) => {
  const biohubApi = useBiohubApi();

  const [showAddSecurityDialog, setShowAddSecurityDialog] = useState(false);

  const dialogContext = useContext(DialogContext);

  const reportAttachmentDetailsDataLoader = useDataLoader((attachmentId: number) =>
    biohubApi.project.getProjectReportDetails(props.projectId, attachmentId)
  );

  const attachmentDetailsDataLoader = useDataLoader((attachmentId: number) =>
    biohubApi.project.getProjectAttachmentDetails(props.projectId, attachmentId)
  );

  const isReportType = props.currentAttachment?.fileType === AttachmentType.REPORT;

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

      await biohubApi.security.addProjectSecurityReasons(props.projectId, securityReasons, [attachmentData]);

      refreshAttachmentDetails();

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
        await biohubApi.security.deleteProjectReportAttachmentSecurityReasons(
          props.projectId,
          props.attachmentId,
          securityIds
        );
      } else {
        await biohubApi.security.deleteProjectAttachmentSecurityReasons(
          props.projectId,
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

        refreshAttachmentDetails();

        dialogContext.setYesNoDialog({ open: false });
      }
    });
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

  const handleDialogEditSave = async (values: IEditReportMetaForm) => {
    if (!reportAttachmentDetailsDataLoader.data || !reportAttachmentDetailsDataLoader.data.metadata) {
      return;
    }

    const fileMeta = values;

    try {
      await biohubApi.project.updateProjectReportMetadata(
        props.projectId,
        reportAttachmentDetailsDataLoader.data.metadata.id,
        AttachmentType.REPORT,
        fileMeta,
        reportAttachmentDetailsDataLoader.data.metadata.revision_count
      );
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
    }
  };

  // Initial load of attachment details
  if (props.currentAttachment) {
    if (isReportType) {
      reportAttachmentDetailsDataLoader.load(props.currentAttachment.id);
    } else {
      attachmentDetailsDataLoader.load(props.currentAttachment.id);
    }
  }

  const refreshAttachmentDetails = () => {
    if (props.currentAttachment) {
      if (isReportType) {
        reportAttachmentDetailsDataLoader.refresh(props.currentAttachment.id);
      } else {
        attachmentDetailsDataLoader.refresh(props.currentAttachment.id);
      }
    }
  };

  const updateReviewTime = async () => {
    try {
      if (props.attachmentId) {
        if (isReportType) {
          await biohubApi.security.updateProjectReportAttachmentSecurityReviewTime(props.projectId, props.attachmentId);
        } else {
          await biohubApi.security.updateProjectAttachmentSecurityReviewTime(props.projectId, props.attachmentId);
        }
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
        selectedSecurityRules={
          (isReportType && reportAttachmentDetailsDataLoader.data?.security_reasons) ||
          attachmentDetailsDataLoader.data?.security_reasons ||
          []
        }
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
          {isReportType && reportAttachmentDetailsDataLoader.data && (
            <ReportAttachmentDetails
              title={reportAttachmentDetailsDataLoader.data?.metadata?.title || ''}
              onFileDownload={openAttachmentFromReportMetaDialog}
              onSave={handleDialogEditSave}
              securityDetails={reportAttachmentDetailsDataLoader.data}
              attachmentSize={(props.currentAttachment && getFormattedFileSize(props.currentAttachment.size)) || '0 KB'}
              refresh={() =>
                props.currentAttachment?.id && reportAttachmentDetailsDataLoader.refresh(props.currentAttachment.id)
              }
            />
          )}

          {!isReportType && attachmentDetailsDataLoader.data && (
            <AttachmentDetails
              title={props.currentAttachment?.fileName || ''}
              attachmentSize={(props.currentAttachment && getFormattedFileSize(props.currentAttachment.size)) || '0 KB'}
              onFileDownload={openAttachmentFromReportMetaDialog}
            />
          )}

          <ViewSecurityTable
            securityDetails={
              (isReportType && reportAttachmentDetailsDataLoader.data) || attachmentDetailsDataLoader.data || null
            }
            showAddSecurityDialog={setShowAddSecurityDialog}
            showDeleteSecurityReasonDialog={showDeleteSecurityReasonDialog}
            updateReviewTime={updateReviewTime}
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

export default ProjectAttachmentDetailsDialog;
