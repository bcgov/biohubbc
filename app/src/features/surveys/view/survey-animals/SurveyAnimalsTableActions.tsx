import { mdiDotsVertical, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

export interface ITableActionsMenuProps {
  critter_id: string;
  onAddDevice: (critter_id: string) => void;
  onRemoveDevice: (critter_id: string) => void;
  onEditDevice: (critter_id: string) => void;
  onEditCritter: (critter_id: string) => void;
}

const SurveyAnimalsTableActions = (props: ITableActionsMenuProps) => {
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
      <IconButton aria-label="Animal actions" onClick={handleClick} data-testid="animal actions" tabIndex={0}>
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
        id="animal-table-row-action"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}>
        <MenuItem
          onClick={() => {
            handleClose();
            props.onAddDevice(props.critter_id);
          }}
          data-testid="animal-table-row-add-device">
          <ListItemIcon>
            <Icon path={mdiPlus} size={1} />
          </ListItemIcon>
          <Typography variant="inherit">Add Telemetry Device</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            props.onRemoveDevice(props.critter_id);
          }}
          data-testid="animal-table-row-remove-device">
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <Typography variant="inherit">Remove Telemetry Device</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            props.onEditDevice(props.critter_id);
          }}
          data-testid="funding-source-table-row-edit-timespan">
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          <Typography variant="inherit">Edit Deployment Timespan</Typography>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            props.onEditCritter(props.critter_id);
          }}
          data-testid="funding-source-table-row-edit-critter">
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          <Typography variant="inherit">Edit Critter Details</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default SurveyAnimalsTableActions;
