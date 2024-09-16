import { mdiAttachment, mdiFilePdfBox, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import { FileUploadDialog } from 'components/dialog/attachments/FileUploadDialog';
import { ReportFileUploadDialog } from 'components/dialog/attachments/ReportFileUploadDialog';
import { ProjectRoleGuard } from 'components/security/Guards';
import { H2MenuToolbar } from 'components/toolbar/ActionToolbars';
import { AttachmentsI18N, ReportI18N } from 'constants/i18n';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { SurveyContext } from 'contexts/surveyContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import { useContext, useState } from 'react';
import SurveyAttachmentsList from './SurveyAttachmentsList';

const SurveyAttachments = () => {
  const biohubApi = useBiohubApi();

  const dialogContext = useDialogContext();
  const surveyContext = useContext(SurveyContext);

  const { projectId, surveyId } = surveyContext;

  const [openUploadDialog, setOpenUploadDialog] = useState<'Attachment' | 'Report' | false>(false);

  const onSubmitReport = async (fileMeta: IReportMetaForm) => {
    try {
      await biohubApi.survey.uploadSurveyReports(projectId, surveyId, fileMeta.attachmentFile, fileMeta);
    } catch (error) {
      const apiError = error as APIError;

      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: ReportI18N.uploadErrorTitle,
        dialogText: ReportI18N.uploadErrorText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });
    }
  };

  const handleUploadAttachments = async (file: File) => {
    try {
      await biohubApi.survey.uploadSurveyAttachments(projectId, surveyId, file);
    } catch (error) {
      const apiError = error as APIError;

      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: AttachmentsI18N.uploadErrorTitle,
        dialogText: AttachmentsI18N.uploadErrorText,
        dialogError: apiError.message,
        dialogErrorDetails: apiError.errors,
        onClose: () => {
          dialogContext.setErrorDialog({ open: false });
        },
        onOk: () => {
          dialogContext.setErrorDialog({ open: false });
        }
      });
    }
  };

  return (
    <>
      <ReportFileUploadDialog
        open={openUploadDialog === 'Report'}
        onSubmit={onSubmitReport}
        onClose={() => {
          surveyContext.artifactDataLoader.refresh(projectId, surveyId);
          setOpenUploadDialog(false);
        }}
      />

      <FileUploadDialog
        open={openUploadDialog === 'Attachment'}
        dialogTitle="Upload Attachments"
        uploadHandler={handleUploadAttachments}
        onClose={() => {
          surveyContext.artifactDataLoader.refresh(projectId, surveyId);
          setOpenUploadDialog(false);
        }}
      />

      <Box>
        <H2MenuToolbar
          label="Documents"
          buttonLabel="Upload"
          buttonTitle="Upload Documents"
          buttonProps={{ variant: 'contained' }}
          buttonStartIcon={<Icon path={mdiTrayArrowUp} size={0.75} />}
          menuItems={[
            {
              menuLabel: 'Upload a Report',
              menuIcon: <Icon path={mdiFilePdfBox} size={1} />,
              menuOnClick: () => setOpenUploadDialog('Report')
            },
            {
              menuLabel: 'Upload Attachments',
              menuIcon: <Icon path={mdiAttachment} size={1} />,
              menuOnClick: () => setOpenUploadDialog('Attachment')
            }
          ]}
          renderButton={(buttonProps) => (
            <ProjectRoleGuard
              validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <Button {...buttonProps} />
            </ProjectRoleGuard>
          )}
        />

        <Divider />

        <Box p={2}>
          <SurveyAttachmentsList />
        </Box>
      </Box>
    </>
  );
};

export default SurveyAttachments;
