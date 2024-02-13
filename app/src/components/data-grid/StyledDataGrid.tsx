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
  const noRowsOverlay = useCallback(
    () => <StyledDataGridOverlay message={props.noRowsMessage} />,
    [props.noRowsMessage]
  );
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
        '& .MuiDataGrid-columnHeaderTitle': {
          textTransform: 'uppercase',
          fontWeight: 700
        },
        '& .MuiDataGrid-row:nth-of-type(odd)': {
          backgroundColor: grey[50]
        },
        '& .MuiDataGrid-row:last-of-type': {
          '& .MuiDataGrid-cell': {
            borderBottom: 'none'
          }
        }
      }}
    />
  );
};
