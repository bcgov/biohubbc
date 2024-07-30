import { mdiArrowTopRight, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Menu, MenuItem, Typography } from '@mui/material';
import { GridColDef, GridOverlay, GridRowSelectionModel, GridValidRowModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { useState } from 'react';

interface IGenericDataGridProps<T extends GridValidRowModel> {
  rows: T[];
  columns: GridColDef<T>[];
  rowSelectionModel: GridRowSelectionModel;
  handleRowSelection: (selection: GridRowSelectionModel) => void;
  noRowsMessage?: string;
  noRowsOverlayTitle?: string;
  noRowsOverlaySubtitle?: string;
  checkboxSelection?: boolean;
  getRowId?: (row: T) => string | number;
  sx?: object;
  onRowActionClick?: (action: string, row: T) => void; // Callback for row actions
}

export const SamplingSiteManageTable = <T extends { id: number | string }>({
  rows,
  columns,
  rowSelectionModel,
  handleRowSelection,
  noRowsMessage = 'No data',
  noRowsOverlayTitle = 'No Data Available',
  noRowsOverlaySubtitle = 'No data to display',
  checkboxSelection = false,
  getRowId = (row) => row.id,
  sx = {},
  onRowActionClick = () => {}
}: IGenericDataGridProps<T>) => {
  const [actionMenuRow, setActionMenuRow] = useState<T | null>(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<HTMLElement | null>(null);

  console.log(setActionMenuRow)

  const handleMenuItemClick = (action: string) => {
    if (actionMenuRow) {
      onRowActionClick(action, actionMenuRow);
    }
    setActionMenuAnchorEl(null);
  };

  return (
    <>
      <StyledDataGrid
        noRowsMessage={noRowsMessage}
        rowSelection={false}
        autoHeight
        getRowHeight={() => 'auto'}
        rows={rows}
        getRowId={getRowId}
        columns={columns}
        rowSelectionModel={rowSelectionModel}
        onRowSelectionModelChange={(newSelection: GridRowSelectionModel) => handleRowSelection(newSelection)}
        checkboxSelection={checkboxSelection}
        noRowsOverlay={
          <GridOverlay>
            <NoDataOverlay title={noRowsOverlayTitle} subtitle={noRowsOverlaySubtitle} icon={mdiArrowTopRight} />
          </GridOverlay>
        }
        sx={{
          '& .MuiDataGrid-virtualScroller': {
            height: rows.length === 0 ? '250px' : 'unset',
            overflowY: 'auto !important',
            overflowX: 'hidden'
          },
          '& .MuiDataGrid-overlay': {
            height: '250px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          },
          ...sx
        }}
      />

      <Menu
        open={Boolean(actionMenuAnchorEl)}
        onClose={() => setActionMenuAnchorEl(null)}
        anchorEl={actionMenuAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={() => handleMenuItemClick('edit')}>
          <Icon path={mdiPencilOutline} size={1} />
          <Typography>Edit Details</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('delete')}>
          <Icon path={mdiTrashCanOutline} size={1} />
          <Typography>Delete</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
