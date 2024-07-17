import { mdiDotsVertical, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useObservationsTableContext } from 'hooks/useContext';
import { useState } from 'react';
import { pluralize as p } from 'utils/Utils';

export interface IBulkActionsButtonProps {
  /**
   * Controls the disabled state of the button.
   *
   * @type {boolean}
   * @memberof IBulkActionsButtonProps
   */
  disabled: boolean;
}

export const BulkActionsButton = (props: IBulkActionsButtonProps) => {
  const { disabled } = props;

  const observationsTableContext = useObservationsTableContext();

  const [contextMenuAnchorEl, setContextMenuAnchorEl] = useState<Element | null>(null);

  const numSelectedRows = observationsTableContext.rowSelectionModel.length;

  return (
    <>
      <IconButton
        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          setContextMenuAnchorEl(event.currentTarget);
        }}
        edge="end"
        disabled={numSelectedRows === 0}
        aria-label="observation options"
        title="Bulk Actions">
        <Icon size={1} path={mdiDotsVertical} />
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
        id="survey-observations-table-actions-menu"
        anchorEl={contextMenuAnchorEl}
        open={Boolean(contextMenuAnchorEl)}
        onClose={() => setContextMenuAnchorEl(null)}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}>
        <MenuItem
          onClick={() => {
            observationsTableContext.deleteObservationRecords(observationsTableContext.getSelectedObservationRecords());
            setContextMenuAnchorEl(null);
          }}
          disabled={disabled}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <Typography variant="inherit">Delete {p(numSelectedRows, 'Observation')}</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
