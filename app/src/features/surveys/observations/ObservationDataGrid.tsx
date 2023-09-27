import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';

export interface IObservationDataGridProps {
  columns: any[];
}

export const ObservationDataGrid: React.FC<IObservationDataGridProps> = (props) => {
  return (
    <Box display="flex" flex="1 1 auto" flexDirection="column">
      {/* <Toolbar
                variant="dense"
                sx={{
                  flex: '0 0 auto',
                  borderBottom: '1px solid #ccc'
                }}
              >
                <Typography variant="body2"><strong>Records</strong></Typography>
              </Toolbar> */}
      <Box flex="1 1 auto" px={2} height="100%">
        <DataGrid
          columns={props.columns}
          rows={[]}
          localeText={{ noRowsLabel: 'No Records' }}
          sx={{
            background: '#fff',
            border: 'none',
            '& .MuiDataGrid-pinnedColumns, .MuiDataGrid-pinnedColumnHeaders': {
              background: '#fff'
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#999'
            },
            '& .test': {
              position: 'sticky',
              right: 0,
              top: 0,
              borderLeft: '1px solid #ccc',
              background: '#fff'
            },
            '& .MuiDataGrid-columnHeaders': {
              position: 'relative'
            },
            '& .MuiDataGrid-columnHeaders:after': {
              content: "''",
              position: 'absolute',
              right: 0,
              width: '79px',
              height: '80px',
              borderLeft: '1px solid #ccc',
              background: '#fff'
            }
          }}
        />
      </Box>
    </Box>
  );
};
