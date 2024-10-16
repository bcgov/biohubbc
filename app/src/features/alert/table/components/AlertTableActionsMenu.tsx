import { mdiDotsVertical, mdiInformationOutline, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

export interface IAlertTableActionsMenuProps {
  alertId: number;
  onView: (alertId: number) => void;
  onEdit: (alertId: number) => void;
  onDelete: (alertId: number) => void;
}

const AlertTableActionsMenu = (props: IAlertTableActionsMenuProps) => {
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
      <IconButton
        aria-label="Alert actions"
        onClick={handleClick}
        data-testid="alert-table-row-action"
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
        id="alert-table-row-action"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}>
        <MenuItem
          onClick={() => {
            handleClose();
            props.onView(props.alertId);
          }}
          data-testid="alert-table-row-view">
          <ListItemIcon>
            <Icon path={mdiInformationOutline} size={1} />
          </ListItemIcon>
          <Typography variant="inherit">View Details</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            props.onEdit(props.alertId);
          }}
          data-testid="alert-table-row-edit">
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          <Typography variant="inherit">Edit</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            props.onDelete(props.alertId);
          }}
          data-testid="alert-table-row-delete">
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <Typography variant="inherit">Delete</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AlertTableActionsMenu;
