import { mdiDotsVertical, mdiInformationOutline, mdiTrashCanOutline, mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { ProjectRoleGuard, SystemRoleGuard } from 'components/security/Guards';
import { AttachmentType, PublishStatus } from 'constants/attachments';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { useState } from 'react';

//TODO: PRODUCTION_BANDAGE: Remove <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}> from `Remove or Resubmit` button.

interface IAttachmentsListItemMenuButtonProps {
  attachmentStatus: PublishStatus;
  attachmentFileType: string;
  onDownloadFile: () => void;
  onDeleteFile: () => void;
  onViewDetails: () => void;
  onRemoveOrResubmit: () => void;
}

const AttachmentsListItemMenuButton = (props: IAttachmentsListItemMenuButtonProps) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
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
                props.onDownloadFile();
                handleClose();
              }}
              data-testid="attachment-action-menu-download">
              <ListItemIcon>
                <Icon path={mdiTrayArrowDown} size={1} />
              </ListItemIcon>
              Download File
            </MenuItem>
            {props.attachmentFileType === AttachmentType.REPORT && (
              <MenuItem
                onClick={() => {
                  props.onViewDetails();
                  handleClose();
                }}
                data-testid="attachment-action-menu-details">
                <ListItemIcon>
                  <Icon path={mdiInformationOutline} size={1} />
                </ListItemIcon>
                View Details
              </MenuItem>
            )}

            {props.attachmentStatus === PublishStatus.UNSUBMITTED && (
              <ProjectRoleGuard
                validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
                validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                <MenuItem
                  onClick={() => {
                    props.onDeleteFile();
                    handleClose();
                  }}
                  data-testid="attachment-action-menu-delete">
                  <ListItemIcon>
                    <Icon path={mdiTrashCanOutline} size={1} />
                  </ListItemIcon>
                  Delete
                </MenuItem>
              </ProjectRoleGuard>
            )}

            {props.attachmentStatus === PublishStatus.SUBMITTED && (
              <>
                <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <MenuItem
                    onClick={() => {
                      props.onDeleteFile();
                      handleClose();
                    }}
                    data-testid="attachment-action-menu-delete">
                    <ListItemIcon>
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </ListItemIcon>
                    Delete
                  </MenuItem>
                </SystemRoleGuard>

                <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <ProjectRoleGuard
                    validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}>
                    <MenuItem
                      onClick={() => {
                        props.onRemoveOrResubmit();
                        handleClose();
                      }}
                      data-testid="attachment-action-menu-resubmit">
                      <ListItemIcon>
                        <Icon path={mdiTrashCanOutline} size={1} />
                      </ListItemIcon>
                      Remove or Resubmit
                    </MenuItem>
                  </ProjectRoleGuard>
                </SystemRoleGuard>
              </>
            )}
          </Menu>
        </Box>
      </Box>
    </>
  );
};

export default AttachmentsListItemMenuButton;
