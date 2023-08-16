import { mdiDotsVertical, mdiInformationOutline, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

export interface ITableActionsMenuProps {
  fundingSourceId: number;
  onView: (fundingSourceId: number) => void;
  onEdit: (fundingSourceId: number) => void;
  onDelete: (fundingSourceId: number) => void;
}

const TableActionsMenu = (props: ITableActionsMenuProps) => {
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
        aria-label="Funding source actions"
        onClick={handleClick}
        data-testid="funding-source-table-row-action"
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
        id="funding-source-table-row-action"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}>
        <MenuItem
          onClick={() => {
            handleClose();
            props.onView(props.fundingSourceId);
          }}
          data-testid="funding-source-table-row-view">
          <ListItemIcon>
            <Icon path={mdiInformationOutline} size={1} />
          </ListItemIcon>
          <Typography variant="inherit">View Details</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            props.onEdit(props.fundingSourceId);
          }}
          data-testid="funding-source-table-row-edit">
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          <Typography variant="inherit">Edit</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            props.onDelete(props.fundingSourceId);
          }}
          data-testid="funding-source-table-row-delete">
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <Typography variant="inherit">Delete</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default TableActionsMenu;
