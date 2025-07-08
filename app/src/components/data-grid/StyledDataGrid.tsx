import { grey } from '@mui/material/colors';
import { DataGrid, DataGridProps, GridValidRowModel } from '@mui/x-data-grid';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { useCallback } from 'react';
import StyledDataGridOverlay from './StyledDataGridOverlay';

export type StyledDataGridProps = DataGridProps & {
  noRowsMessage?: string;
  noRowsOverlay?: JSX.Element;
};
export const StyledDataGrid = <R extends GridValidRowModel = any>(props: StyledDataGridProps) => {
  const loadingOverlay = () => <SkeletonTable />;

  const noRowsOverlay = useCallback(
    () => props.noRowsOverlay ?? <StyledDataGridOverlay message={props.noRowsMessage} />,
    [props.noRowsMessage, props.noRowsOverlay]
  );

  return (
    <DataGrid<R>
      autoHeight
      {...props}
      disableColumnMenu
      slots={{
        loadingOverlay: loadingOverlay,
        noRowsOverlay: noRowsOverlay,
        ...props.slots
      }}
      sx={{
        '& *:focus-within': {
          outline: 'none !important'
        },
        '& .MuiDataGrid-columnHeaders': {
          background: grey[50]
        },
        '& .MuiDataGrid-columnHeaderTitle': {
          textTransform: 'uppercase',
          fontWeight: 700
        },
        '& .MuiDataGrid-row:last-of-type': {
          '& .MuiDataGrid-cell': {
            borderBottom: 'none'
          }
        },
        '& .MuiDataGrid-cell:last-of-type': {
          pr: `10 !important` // Add right padding (you can also use `mr` for margin)
        },
        // Define custom header padding for the first column vs every other column
        '& .MuiDataGrid-columnHeader:first-of-type:not(.MuiDataGrid-columnHeaderCheckbox)': {
          pl: 3 // Add extra padding to the first header, unless it is a checkbox header
        },
        '& .MuiDataGrid-columnHeader:first-of-type.MuiDataGrid-columnHeaderCheckbox': {
          pl: 2 // Add extra padding to the first header when it is a checkbox header
        },
        '& .MuiDataGrid-columnHeader:not(:first-of-type)': {
          pl: 1 // Add extra padding to every other header
        },
        // Define custom cell padding for the first column vs every other column
        '& .MuiDataGrid-cell:first-of-type:not(.MuiDataGrid-cellCheckbox)': {
          pl: 3 // Add extra padding to the first cell, unless it is a checkbox cell
        },
        '& .MuiDataGrid-cell:first-of-type.MuiDataGrid-cellCheckbox': {
          pl: 2 // Add extra padding to the first cell when it is a checkbox cell
        },
        '& .MuiDataGrid-cell:not(:first-of-type)': {
          pl: 1 // Add extra padding to every other cell
        },
        // Ensure the draggable container is at least 50px wide
        '& .MuiDataGrid-columnHeaderDraggableContainer': {
          minWidth: '50px'
        },
        // Custom styling for cell content at different densities
        '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': {
          py: '8px',
          wordWrap: 'anywhere'
        },
        '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': {
          py: '15px',
          wordWrap: 'anywhere'
        },
        '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': {
          py: '22px',
          wordWrap: 'anywhere'
        },
        border: 'none',
        ...props.sx
      }}
    />
  );
};
