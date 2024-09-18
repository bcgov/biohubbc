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
import { ReportI18N } from 'constants/i18n';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { ProjectContext } from 'contexts/projectContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import { useContext, useEffect, useState } from 'react';
import ProjectAttachmentsList from './ProjectAttachmentsList';

/**
 * Project attachments component.
 *
 * @return {*}
 */
const ProjectAttachments = () => {
  const biohubApi = useBiohubApi();

  const dialogContext = useDialogContext();
  const projectContext = useContext(ProjectContext);

  const [openUploadDialog, setOpenUploadDialog] = useState<'Attachment' | 'Report' | false>(false);

  const onSubmitReport = async (fileMeta: IReportMetaForm) => {
    try {
      await biohubApi.project.uploadProjectReports(projectContext.projectId, fileMeta.attachmentFile, fileMeta);
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
    return biohubApi.project.uploadProjectAttachments(projectContext.projectId, file);
  };

  useEffect(() => {
    projectContext.artifactDataLoader.load(projectContext.projectId);
  }, [projectContext.artifactDataLoader, projectContext.projectId]);

  return (
    <>
      <ReportFileUploadDialog
        open={openUploadDialog === 'Report'}
        onSubmit={onSubmitReport}
        onClose={() => {
          projectContext.artifactDataLoader.refresh(projectContext.projectId);
          setOpenUploadDialog(false);
        }}
      />

      <FileUploadDialog
        open={openUploadDialog === 'Attachment'}
        dialogTitle="Upload Attachments"
        uploadHandler={handleUploadAttachments}
        onClose={() => {
          projectContext.artifactDataLoader.refresh(projectContext.projectId);
          setOpenUploadDialog(false);
        }}
      />

      <H2MenuToolbar
        label="Shared Files"
        buttonLabel="Upload"
        buttonTitle="Upload Shared Files"
        buttonProps={{ variant: 'contained', disableElevation: true }}
        buttonStartIcon={<Icon path={mdiTrayArrowUp} size={1} />}
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
      <Divider></Divider>
      <Box p={2}>
        <ProjectAttachmentsList />
      </Box>
    </>
  );
};

export default ProjectAttachments;
