import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { DataGrid } from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import { mdiArrowLeft, mdiCogOutline, mdiDotsVertical, mdiImport, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { grey } from '@mui/material/colors';
// import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
// import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

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
    disableColumnMenu: true,
  },
  { 
    field: 'date', 
    headerName: 'Date',
    editable: true,
    type: 'date',
    minWidth: 150,
    disableColumnMenu: true,
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
    ],
  }
];

const rows = [
  { id: 1, speciesName: 'Moose (Alces Americanus', samplingSite: 'Site 1', samplingMethod: 'Method 1' },
  { id: 2, speciesName: 'Moose (Alces Americanus', samplingSite: 'Site 1', samplingMethod: 'Method 1' },
  { id: 3, speciesName: 'Moose (Alces Americanus', samplingSite: 'Site 1', samplingMethod: 'Method 1' }
];


export default function RenderHeaderGrid() {
  return (
    <div style={{ height: 300, width: '100%' }}>
      <Button variant="text">Add Attribute</Button>
    </div>
  );
}

export const PrototypePage = () => {
  
  // const [expanded, setExpanded] = React.useState<string | false>(false);

  // const handleChange =
  //   (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
  //     setExpanded(isExpanded ? panel : false);
  //   };

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
        elevation={1}
        sx={{
          flex: '0 0 auto'
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            sx={{
              mr: 2
            }}
          >
            <Icon path={mdiArrowLeft} size={1}></Icon>
          </IconButton>
          <Typography component="h1" variant="h4">Manage Observations Prototype</Typography>
        </Toolbar>
      </AppBar>
      
      <Box 
        display="flex" 
        flex='1 1 auto'
      >
        {/* Sampling Site List */}
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
            sx={{
              overflowY: 'scroll',
              background: grey[50],
              '& .MuiAccordion-root + .MuiAccordion-root': {
                borderTopStyle: 'solid',
                borderTopWidth: '1px',
                borderTopColor: grey[300]
              }
            }}
          >
            
            <Accordion 
              square 
              disableGutters 
              sx={{
                boxShadow: 'none',
                '&:before': {
                  display: 'none'
                }
              }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" py={1} px={3}>
                <AccordionSummary
                  aria-controls="panel1bh-content"
                  id="panel1bh-header"
                  sx={{
                    p: 0
                  }}
                >
                  <Typography variant="body2" sx={{fontWeight: 700}}>Sampling Site 1</Typography>
                </AccordionSummary>
                <IconButton
                  edge="end"
                >
                  <Icon path={mdiDotsVertical} size={1}></Icon>
                </IconButton>
              </Box>
              <AccordionDetails
                sx={{
                  pt: 0
                }}
              >
                <List component="div" disablePadding>
                  <ListItem
                    sx={{
                      background: grey[200]
                    }}
                  >
                    <ListItemText>
                      <Typography variant="body2">Method 1</Typography>
                    </ListItemText>
                  </ListItem>
                </List>
                <List disablePadding>
                  <ListItem>
                    <ListItemText>
                      <Typography variant="body2">YYYY-MM-DD to YYYY-MM-DD</Typography>
                    </ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemText>
                      <Typography variant="body2">YYYY-MM-DD to YYYY-MM-DD</Typography>
                    </ListItemText>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion 
              square 
              disableGutters 
              sx={{
                boxShadow: 'none',
                '&:before': {
                  display: 'none'
                }
              }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" py={1} px={3}>
                <AccordionSummary
                  aria-controls="panel1bh-content"
                  id="panel1bh-header"
                  sx={{
                    p: 0
                  }}
                >
                  <Typography variant="body2" sx={{fontWeight: 700}}>Sampling Site 1</Typography>
                </AccordionSummary>
                <IconButton
                  edge="end"
                >
                  <Icon path={mdiDotsVertical} size={1}></Icon>
                </IconButton>
              </Box>
              <AccordionDetails
                sx={{
                  pt: 0
                }}
              >
                <List disablePadding>
                  <ListItem
                    sx={{
                      background: grey[200]
                    }}
                  >
                    <ListItemText>
                      <Typography variant="body2">Method 1</Typography>
                    </ListItemText>
                  </ListItem>
                </List>
                <List disablePadding>
                  <ListItem>
                    <ListItemText>
                      <Typography variant="body2">YYYY-MM-DD to YYYY-MM-DD</Typography>
                    </ListItemText>
                  </ListItem>
                  <ListItem>
                    <ListItemText>
                      <Typography variant="body2">YYYY-MM-DD to YYYY-MM-DD</Typography>
                    </ListItemText>
                  </ListItem>
                </List>
              </AccordionDetails>
            </Accordion>

          </Box>
        </Box>

        {/* Observations Component */}
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
              borderBottom: '1px solid #ccc',
              '& Button + Button': {
                ml: 1
              }
            }}
          >
            <Typography
              sx={{
                flexGrow: '1'
              }}
            >
              <strong>Observations</strong>
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={
                <Icon path={mdiImport} size={1} />
              }>
              Import Data
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={
                <Icon path={mdiPlus} size={1} />
              }>
              Add Record
            </Button>
            <Button 
              variant="outlined"
              startIcon={
                <Icon path={mdiCogOutline} size={1} />
              }
            >
              Columns
            </Button>
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
              <DataGrid
                columns={columns} 
                rows={rows}
                localeText={{ noRowsLabel: "No observations" }}
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
        </Box>
      </Box>
    </Box>

  );
};
