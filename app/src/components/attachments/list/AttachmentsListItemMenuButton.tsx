import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { mdiDotsVertical, mdiInformationOutline, mdiTrashCanOutline, mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
import RemoveOrResubmitDialog from 'components/publish/components/RemoveOrResubmitDialog';
import { ProjectRoleGuard, SystemRoleGuard } from 'components/security/Guards';
import { AttachmentType, PublishStatus } from 'constants/attachments';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyContext } from 'contexts/surveyContext';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';

interface IAttachmentsListItemMenuButtonProps<T extends IGetProjectAttachment | IGetSurveyAttachment> {
  attachment: T;
  handleDownloadFile: (attachment: T) => void;
  handleDeleteFile: (attachment: T) => void;
  handleViewDetails: (attachment: T) => void;
}

const AttachmentsListItemMenuButton = <T extends IGetProjectAttachment | IGetSurveyAttachment>(
  props: IAttachmentsListItemMenuButtonProps<T>
) => {
  const surveyContext = React.useContext(SurveyContext);
  const projectContext = React.useContext(ProjectContext);
  const parentName =
    surveyContext.surveyDataLoader.data?.surveyData.survey_details.survey_name ||
    projectContext.projectDataLoader.data?.projectData.project.project_name;

  const [anchorEl, setAnchorEl] = useState(null);
  const [openRemoveOrResubmitDialog, setOpenRemoveOrResubmitDialog] = useState(false);
  const [RemoveOrResubmitDialogFile, setRemoveOrResubmitDialogFile] = useState<T | null>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <RemoveOrResubmitDialog
        projectId={projectContext.projectId}
        fileName={RemoveOrResubmitDialogFile?.fileName || ''}
        parentName={parentName || ''}
        status={
          (RemoveOrResubmitDialogFile?.supplementaryAttachmentData && PublishStatus.SUBMITTED) ||
          PublishStatus.UNSUBMITTED
        }
        submittedDate={RemoveOrResubmitDialogFile?.supplementaryAttachmentData?.event_timestamp || ''}
        open={openRemoveOrResubmitDialog}
        setOpen={setOpenRemoveOrResubmitDialog}
        onClose={() => setOpenRemoveOrResubmitDialog(false)}
      />
      <Box my={-1}>
        <Box>
          <IconButton
            aria-label="Document actions"
            onClick={handleClick}
            data-testid="attachment-action-menu"
            tabIndex={0}>
            <Icon path={mdiDotsVertical} size={1} />
          </IconButton>
          <Menu
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}>
            <MenuItem
              onClick={() => {
                props.handleDownloadFile(props.attachment);
                setAnchorEl(null);
              }}
              data-testid="attachment-action-menu-download">
              <ListItemIcon>
                <Icon path={mdiTrayArrowDown} size={1} />
              </ListItemIcon>
              Download File
            </MenuItem>
            {props.attachment.fileType === AttachmentType.REPORT && (
              <MenuItem
                onClick={() => {
                  props.handleViewDetails(props.attachment);
                  setAnchorEl(null);
                }}
                data-testid="attachment-action-menu-details">
                <ListItemIcon>
                  <Icon path={mdiInformationOutline} size={1} />
                </ListItemIcon>
                View Details
              </MenuItem>
            )}
            <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <MenuItem
                onClick={() => {
                  props.handleDeleteFile(props.attachment);
                  setAnchorEl(null);
                }}
                data-testid="attachment-action-menu-delete">
                <ListItemIcon>
                  <Icon path={mdiTrashCanOutline} size={1} />
                </ListItemIcon>
                Delete
              </MenuItem>
            </SystemRoleGuard>
            <ProjectRoleGuard
              validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}
              validSystemRoles={[SYSTEM_ROLE.PROJECT_CREATOR]}>
              <MenuItem
                onClick={() => {
                  setRemoveOrResubmitDialogFile(props.attachment);
                  setOpenRemoveOrResubmitDialog(true);
                  setAnchorEl(null);
                }}
                data-testid="attachment-action-menu-resubmit">
                <ListItemIcon>
                  <Icon path={mdiTrashCanOutline} size={1} />
                </ListItemIcon>
                Remove or Resubmit
              </MenuItem>
            </ProjectRoleGuard>
          </Menu>
        </Box>
      </Box>
    </>
  );
};

export default AttachmentsListItemMenuButton;
