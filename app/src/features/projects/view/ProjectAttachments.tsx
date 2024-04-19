import { mdiAttachment, mdiFilePdfBox, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import FileUploadWithMetaDialog from 'components/dialog/attachments/FileUploadWithMetaDialog';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { ProjectRoleGuard } from 'components/security/Guards';
import { H2MenuToolbar } from 'components/toolbar/ActionToolbars';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { ProjectContext } from 'contexts/projectContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IUploadAttachmentResponse } from 'interfaces/useProjectApi.interface';
import { useContext, useEffect, useState } from 'react';
import { AttachmentType } from '../../../constants/attachments';
import ProjectAttachmentsList from './ProjectAttachmentsList';

/**
 * Project attachments content for a project.
 *
 * @return {*}
 */
const ProjectAttachments = () => {
  const biohubApi = useBiohubApi();

  const projectContext = useContext(ProjectContext);

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);
  const [attachmentType, setAttachmentType] = useState<AttachmentType.REPORT | AttachmentType.OTHER>(
    AttachmentType.OTHER
  );

  const handleUploadReportClick = () => {
    setAttachmentType(AttachmentType.REPORT);
    setOpenUploadAttachments(true);
  };

  const handleUploadAttachmentClick = () => {
    setAttachmentType(AttachmentType.OTHER);
    setOpenUploadAttachments(true);
  };

  const getUploadHandler = (): IUploadHandler<IUploadAttachmentResponse> => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return biohubApi.project.uploadProjectAttachments(
        projectContext.projectId,
        file,
        cancelToken,
        handleFileUploadProgress
      );
    };
  };

  const getFinishHandler = () => {
    return (fileMeta: IReportMetaForm) => {
      return biohubApi.project
        .uploadProjectReports(projectContext.projectId, fileMeta.attachmentFile, fileMeta)
        .finally(() => {
          setOpenUploadAttachments(false);
        });
    };
  };

  useEffect(() => {
    projectContext.artifactDataLoader.load(projectContext.projectId);
  }, [projectContext.artifactDataLoader, projectContext.projectId]);

  return (
    <>
      <FileUploadWithMetaDialog
        open={openUploadAttachments}
        dialogTitle={attachmentType === AttachmentType.REPORT ? 'Upload Report' : 'Upload Attachment'}
        attachmentType={attachmentType}
        onFinish={getFinishHandler()}
        onClose={() => {
          setOpenUploadAttachments(false);
          projectContext.artifactDataLoader.refresh(projectContext.projectId);
        }}
        uploadHandler={getUploadHandler()}
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
            menuOnClick: handleUploadReportClick
          },
          {
            menuLabel: 'Upload Attachments',
            menuIcon: <Icon path={mdiAttachment} size={1} />,
            menuOnClick: handleUploadAttachmentClick
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
