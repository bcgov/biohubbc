import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { mdiDotsVertical, mdiInformationOutline, mdiTrashCanOutline, mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
import RemoveOrResubmitDialog from 'components/publish/components/RemoveOrResubmitDialog';
import { SystemRoleGuard } from 'components/security/Guards';
import { AttachmentType } from 'constants/attachments';
import { SYSTEM_ROLE } from 'constants/roles';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';

interface IAttachmentsListItemMenuButtonProps<T extends IGetProjectAttachment | IGetSurveyAttachment> {
  attachment: T;
  handleDownloadFile: (attachment: T) => void;
  // handleRemoveOrResubmitFile: (attachment: T) => void;
  handleViewDetails: (attachment: T) => void;
}

const AttachmentsListItemMenuButton = <T extends IGetProjectAttachment | IGetSurveyAttachment>(
  props: IAttachmentsListItemMenuButtonProps<T>
) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [openRemoveOrResubmitDialog, setOpenRemoveOrResubmitDialog] = useState(false);
  const [RemoveOrResubmitDialogFile, setRemoveOrResubmitDialogFile] = useState<T | null>(null);

  return (
    <>
      <RemoveOrResubmitDialog
        file={RemoveOrResubmitDialogFile}
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
                  // props.handleRemoveOrResubmitFile(props.attachment);
                  setRemoveOrResubmitDialogFile(props.attachment);
                  setOpenRemoveOrResubmitDialog(true);
                  setAnchorEl(null);
                }}
                data-testid="attachment-action-menu-delete">
                <ListItemIcon>
                  <Icon path={mdiTrashCanOutline} size={1} />
                </ListItemIcon>
                Remove or Resubmit
              </MenuItem>
            </SystemRoleGuard>
          </Menu>
        </Box>
      </Box>
    </>
  );
};

export default AttachmentsListItemMenuButton;
