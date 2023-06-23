import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { mdiDotsVertical, mdiInformationOutline, mdiTrashCanOutline, mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
import { ProjectRoleGuard, SystemRoleGuard } from 'components/security/Guards';
import { AttachmentType, PublishStatus } from 'constants/attachments';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
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

            {props.attachmentStatus === PublishStatus.SUBMITTED && (
              <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                <ProjectRoleGuard validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}>
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
            )}
          </Menu>
        </Box>
      </Box>
    </>
  );
};

export default AttachmentsListItemMenuButton;
