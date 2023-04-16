import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { mdiAttachment, mdiChevronDown, mdiFilePdfBox, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import FileUploadWithMetaDialog from 'components/dialog/attachments/FileUploadWithMetaDialog';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { ProjectRoleGuard } from 'components/security/Guards';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { ProjectContext } from 'contexts/projectContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IUploadAttachmentResponse } from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useState } from 'react';
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
    handleClose();
  };

  const handleUploadAttachmentClick = () => {
    setAttachmentType(AttachmentType.OTHER);
    setOpenUploadAttachments(true);
    handleClose();
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

  // Show/Hide Project Settings Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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

      {/* Need to use the regular toolbar in lieu of these action toolbars given it doesn't support multiple buttons */}
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h2">
          Documents
        </Typography>
        <Box>
          <ProjectRoleGuard
            validProjectRoles={[PROJECT_ROLE.PROJECT_EDITOR, PROJECT_ROLE.PROJECT_LEAD]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button
              color="primary"
              variant="contained"
              endIcon={<Icon path={mdiChevronDown} size={1} />}
              aria-controls="simple-menu"
              aria-haspopup="true"
              startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
              onClick={handleClick}>
              Add Documents
            </Button>
          </ProjectRoleGuard>
          <Menu
            style={{ marginTop: '8px' }}
            id="attachmentsMenu"
            anchorEl={anchorEl}
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}>
            <MenuItem onClick={handleUploadReportClick}>
              <ListItemIcon>
                <Icon path={mdiFilePdfBox} size={1} />
              </ListItemIcon>
              <Typography variant="inherit">Add Report</Typography>
            </MenuItem>
            <MenuItem onClick={handleUploadAttachmentClick}>
              <ListItemIcon>
                <Icon path={mdiAttachment} size={1} />
              </ListItemIcon>
              <Typography variant="inherit">Add Attachments</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      <Divider></Divider>
      <Box px={1}>
        <ProjectAttachmentsList />
      </Box>
    </>
  );
};

export default ProjectAttachments;
