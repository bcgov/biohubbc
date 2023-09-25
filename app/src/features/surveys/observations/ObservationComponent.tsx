import { mdiCogOutline, mdiDotsVertical, mdiImport, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ObservationDataGrid } from './ObservationDataGrid';

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
    minWidth: 200,
    disableColumnMenu: true
  },
  {
    field: 'samplingMethod',
    headerName: 'Sampling Method',
    editable: true,
    type: 'singleSelect',
    valueOptions: ['Method 1', 'Method 2', 'Method 3', 'Method 4'],
    flex: 1,
    minWidth: 200,
    disableColumnMenu: true
  },
  {
    field: 'samplingPeriod',
    headerName: 'Sampling Period',
    editable: true,
    type: 'singleSelect',
    valueOptions: ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Undefined'],
    flex: 1,
    minWidth: 200,
    disableColumnMenu: true
  },
  {
    field: 'count',
    headerName: 'Count',
    editable: true,
    type: 'number',
    minWidth: 100,
    disableColumnMenu: true
  },
  {
    field: 'date',
    headerName: 'Date',
    editable: true,
    type: 'date',
    minWidth: 150,
    disableColumnMenu: true
  },
  {
    field: 'time',
    headerName: 'Time',
    editable: true,
    type: 'time',
    width: 150,
    disableColumnMenu: true
  },
  {
    field: 'lat',
    headerName: 'Lat',
    type: 'number',
    editable: true,
    width: 150,
    disableColumnMenu: true
  },
  {
    field: 'long',
    headerName: 'Long',
    type: 'number',
    editable: true,
    width: 150,
    disableColumnMenu: true
  },
  {
    field: 'actions',
    headerName: '',
    type: 'actions',
    width: 80,
    disableColumnMenu: true,
    resizable: false,
    cellClassName: 'test',
    getActions: () => [
      <IconButton>
        <Icon path={mdiDotsVertical} size={1} />
      </IconButton>
    ]
  }
];

export const ObservationComponent = () => {
  return (
    <Box display="flex" flexDirection="column" flex="1 1 auto" height="100%">
      {/* Observations Component */}
      <Toolbar
        sx={{
          flex: '0 0 auto',
          borderBottom: '1px solid #ccc',
          '& Button + Button': {
            ml: 1
          }
        }}>
        <Typography
          sx={{
            flexGrow: '1'
          }}>
          <strong>Observations</strong>
        </Typography>
        <Button variant="contained" color="primary" startIcon={<Icon path={mdiImport} size={1} />}>
          Import
        </Button>
        <Button variant="contained" color="primary" startIcon={<Icon path={mdiPlus} size={1} />}>
          Add Record
        </Button>
        <Button
          variant="outlined"
          sx={{
            mr: -1
          }}
          startIcon={<Icon path={mdiCogOutline} size={1} />}>
          Configure
        </Button>
      </Toolbar>
      <Box display="flex" flexDirection="column" flex="1 1 auto">
        {/* Map View */}

        {/* <ObservationMapView /> */}

        {/* Table View */}

        <ObservationDataGrid columns={columns} />
      </Box>
    </Box>
  );
};
