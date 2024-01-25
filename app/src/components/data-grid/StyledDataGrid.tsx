import { grey } from '@mui/material/colors';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';
import StyledDataGridOverlay from './StyledDataGridOverlay';
import Box from '@mui/material/Box';

const StyledLoadingOverlay = () => (
  <Box width="100%" height="100%" sx={{ backgroundColor: grey[300], opacity: 0.25 }}></Box>
);

export const StyledDataGrid = (props: DataGridProps) => {
  return (
    <DataGrid
      {...props}
      autoHeight
      slots={{
        loadingOverlay: StyledLoadingOverlay,
        noRowsOverlay: StyledDataGridOverlay,
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
        },
      }}
    />
  );
};
