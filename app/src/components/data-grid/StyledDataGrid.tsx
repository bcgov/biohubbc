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
        border: 'none',
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
        '& .MuiDataGrid-columnHeader:first-of-type, .MuiDataGrid-cell:first-of-type': {
          pl: 2
        },
        '& .MuiDataGrid-columnHeader:last-of-type, .MuiDataGrid-cell:last-of-type': {
          pr: 2
        },
        '&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell': { py: '8px' },
        '&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell': { py: '15px' },
        '&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell': { py: '22px' },
        '& .MuiTypography-root, .MuiDataGrid-cellContent': {
          fontSize: '0.9rem'
        },
        ...props.sx
      }}
    />
  );
};
