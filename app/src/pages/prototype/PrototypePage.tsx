import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { DataGridPro } from '@mui/x-data-grid-pro/DataGridPro';
import Typography from '@mui/material/Typography';
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';

const columns = [
  { 
    field: 'speciesName', 
    headerName: 'Species',
    editable: true,
    flex: 1,
    minWidth: 250,
    disableColumnMenu: true
  },
  { 
    field: 'samplingSite', 
    headerName: 'Sampling Site',
    editable: true,
    type: 'singleSelect',
    valueOptions: ['Site 1', 'Site 2', 'Site 3', 'Site 4'],
    flex: 1,
    minWidth: 180,
    disableColumnMenu: true
  },
  { 
    field: 'samplingMethod', 
    headerName: 'Sampling Method',
    editable: true,
    type: 'singleSelect',
    valueOptions: ['Method 1', 'Method 2', 'Method 3', 'Method 4'],
    flex: 1,
    minWidth: 250,
    disableColumnMenu: true,

  },
  { 
    field: 'count', 
    headerName: 'Count',
    editable: true,
    type: 'number',
    flex: 0,
    minWidth: 60,
    disableColumnMenu: true,
  },
  { 
    field: 'date', 
    headerName: 'Date',
    editable: true,
    type: 'date',
    flex: 1,
    minWidth: 100,
    disableColumnMenu: true
  },
  { 
    field: 'time', 
    headerName: 'Time',
    editable: true,
    type: 'time',
    flex: 1,
    minWidth: 100,
    disableColumnMenu: true
  },
  { 
    field: 'lat', 
    headerName: 'Lat',
    editable: true,
    flex: 1,
    minWidth: 100,
    disableColumnMenu: true
  },
  { 
    field: 'long', 
    headerName: 'Long',
    editable: true,
    flex: 1,
    minWidth: 100,
    disableColumnMenu: true
  },
  { 
    field: 'actions',
    headerName: '',
    type: 'actions',
    width: 80,
    disableColumnMenu: true,
    resizable: false,
    getActions: () => [
      <IconButton>
        <Icon path={mdiTrashCanOutline} size={1} />
      </IconButton>
    ],
  }
];

const rows = [
  { id: 1, speciesName: 'Moose (Alces Americanus)' },
  { id: 2, speciesName: 'Moose (Alces Americanus)' },
  { id: 3, speciesName: 'Moose (Alces Americanus)' }
];

export default function RenderHeaderGrid() {
  return (
    <div style={{ height: 300, width: '100%' }}>
      <Button variant="text">Add Attribute</Button>
    </div>
  );
}

export const PrototypePage = () => {

  return (

    <Box display="flex" flexDirection="column"
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }}
    >
      <AppBar
        position="relative"
        color="primary"
        elevation={1}
        sx={{
          flex: '0 0 auto'
        }}
      >
        <Toolbar>
          <Typography component="h1" variant="h4">Manage observations Prototype</Typography>
        </Toolbar>
      </AppBar>
      <Box 
        display="flex" 
        flex='1 1 auto'
      >
        <Box 
          display="flex" 
          flexDirection="column" 
          flex="0 0 400px"
          sx={{
            borderRight: '1px solid #ccc'
          }}>
          <Toolbar
            sx={{
              flex: '0 0 auto',
              borderBottom: '1px solid #ccc'
            }}
          >
            <Typography><strong>Sampling Sites</strong></Typography>
          </Toolbar>
          <Box
            flex="1 1 auto"
            p={3}
            sx={{
              overflowY: 'scroll'
            }}
          >
            <Typography>Content</Typography>
          </Box>
        </Box>
        <Box 
          display="flex" 
          flexDirection="column" 
          flex="1 1 auto"
          sx={{
            overflow: 'hidden'
          }}>
          <Toolbar
            sx={{
              flex: '0 0 auto',
              borderBottom: '1px solid #ccc'
            }}
          >
            <Typography
              sx={{
                flexGrow: '1'
              }}
            >
              <strong>Observations</strong>
            </Typography>
            <Button color="primary" variant="outlined">+ Add Attribute</Button>
          </Toolbar>
          <Box 
            flex="1 1 auto"
            px={2}
            sx={{
              background: '#fff'
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                overflow: 'hidden',
              }}
            >
              <DataGridPro 
                columns={columns} 
                rows={rows} 
                initialState={{ pinnedColumns: { right: ['actions'] } }}
                rowReordering
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
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>

  );
};
