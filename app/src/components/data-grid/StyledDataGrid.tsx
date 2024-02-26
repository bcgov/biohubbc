import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import { useCallback } from 'react';
import StyledDataGridOverlay from './StyledDataGridOverlay';

const StyledLoadingOverlay = () => (
  <Box width="100%" height="100%" sx={{ backgroundColor: grey[300], opacity: 0.25 }}></Box>
);
export type StyledDataGridProps = DataGridProps & {
  noRowsMessage?: string;
};
export const StyledDataGrid = (props: StyledDataGridProps) => {
  const noRowsOverlay = useCallback(() => <StyledDataGridOverlay message={props.noRowsMessage} />, []);
  return (
    <DataGrid
      {...props}
      autoHeight
      slots={{
        loadingOverlay: StyledLoadingOverlay,
        noRowsOverlay: noRowsOverlay
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
        "& .MuiDataGrid-row:hover": {
          backgroundColor: "transparent",
        },
        '& .MuiDataGrid-columnHeader:first-of-type, .MuiDataGrid-cell:first-of-type': {
          pl: 2
        },
        '& .MuiDataGrid-columnHeader:last-of-type, .MuiDataGrid-cell:last-of-type': {
          pr: 2
        }
      }}
    />
  );
};
