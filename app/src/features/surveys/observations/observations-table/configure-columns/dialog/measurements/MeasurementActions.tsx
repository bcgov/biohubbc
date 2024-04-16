import { mdiDotsVertical, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';
import { Dispatch, SetStateAction, useState } from 'react';

interface IMeasurementActionsProps {
  setSelectedMeasurements: Dispatch<SetStateAction<CBMeasurementType[]>>;
  measurement: CBMeasurementType;
}

const MeasurementActions = (props: IMeasurementActionsProps) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleDelete = (taxon_measurement_id: string) => {
    props.setSelectedMeasurements((selectedMeasurements) =>
      selectedMeasurements.filter((existing) => existing.taxon_measurement_id !== taxon_measurement_id)
    );
  };

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton aria-label="Document actions" onClick={handleClick} data-testid="attachment-action-menu" tabIndex={0}>
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
            handleDelete(props.measurement.taxon_measurement_id);
          }}
          data-testid="measurement-delete">
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default MeasurementActions;
