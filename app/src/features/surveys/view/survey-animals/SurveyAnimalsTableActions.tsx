import { mdiDotsVertical, mdiMapMarker, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import React, { useState } from 'react';
import { IAnimalDeployment } from './device';

export interface ITableActionsMenuProps {
  critter_id: number;
  devices?: IAnimalDeployment[];
  onMenuOpen: (critter_id: number) => void;
  onAddDevice: (critter_id: number) => void;
  onEditDevice: (critter_id: number) => void;
  onEditCritter: (critter_id: number) => void;
  onRemoveCritter: (critter_id: number) => void;
  onMapOpen: () => void;
}

const SurveyAnimalsTableActions = (props: ITableActionsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget);
    props.onMenuOpen(props.critter_id);
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
        {props.devices?.length ? (
          <MenuItem
            onClick={() => {
              handleClose();
              props.onEditDevice(props.critter_id);
            }}
            data-testid="animal-table-row-edit-timespan">
            <ListItemIcon>
              <Icon path={mdiPencilOutline} size={1} />
            </ListItemIcon>
            <Typography variant="inherit">Edit Telemetry Devices</Typography>
          </MenuItem>
        ) : null}
        <MenuItem
          onClick={() => {
            handleClose();
            props.onEditCritter(props.critter_id);
          }}
          data-testid="animal-table-row-edit-critter">
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          <Typography variant="inherit">Edit Animal</Typography>
        </MenuItem>
        {!props.devices?.length && (
          <MenuItem
            onClick={() => {
              handleClose();
              props.onRemoveCritter(props.critter_id);
            }}
            data-testid="animal-table-row-remove-critter">
            <ListItemIcon>
              <Icon path={mdiTrashCanOutline} size={1} />
            </ListItemIcon>
            <Typography variant="inherit">Remove Animal</Typography>
          </MenuItem>
        )}
        {props.devices?.length ? (
          <MenuItem
            onClick={() => {
              handleClose();
              props.onMapOpen();
            }}
            data-testid="animal-table-row-view-telemetry">
            <ListItemIcon>
              <Icon path={mdiMapMarker} size={1} />
            </ListItemIcon>
            <Typography variant="inherit">View Telemetry</Typography>
          </MenuItem>
        ) : null}
      </Menu>
    </>
  );
};

export default SurveyAnimalsTableActions;
