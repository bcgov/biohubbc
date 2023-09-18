import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
// import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { mdiCogOutline, mdiDotsVertical, mdiImport, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { grey } from '@mui/material/colors';
// import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
// import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import ObservationsTable from './ObservationsTable';
import { useContext, useEffect, useState } from 'react';
import { ObservationsContext } from 'contexts/observationsContext';

export default function RenderHeaderGrid() {
  return (
    <div style={{ height: 300, width: '100%' }}>
      <Button variant="text">Add Attribute</Button>
    </div>
  );
}

export const PrototypePage = () => {
  const observationsContext = useContext(ObservationsContext)
  /*
  useEffect(() => {
    fetchObservationDemoRows().then((rows) => {
      setRows(rows.map((row) => ({
        ...row,
        id: String(row.observation_id),
        isModified: false
      })))
    })
  }, []);
  */

  /*
  const createNewRecord = () => {
    setObservationRows([
      ...observationRows,
      {
        id: uuidv4(),
        observation_id: null,
        isModified: true,
        speciesName: '',
        samplingSite: '',
        samplingMethod: '',
        samplingPeriod: '',
      }
    ])
  }
  */

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
      <Paper square
        sx={{
          pt: 3,
          pb: 3.5,
          px: 3
        }}
      >
        <Breadcrumbs aria-label="breadcrumb"
          sx={{
            mb: 1,
            fontSize: '14px'
          }}
        >
          <Link
            underline="hover"
            href="#"
          >
            Survey Name
          </Link>
          <Typography 
            color="text.secondary" 
            variant='body2'
          >
            Manage Survey Observations
        </Typography>
        </Breadcrumbs>
        <Typography 
          variant="h3" 
          component="h1"
          sx={{
            ml: '-2px'
          }}
        >
          Manage Survey Observations
      </Typography>
      </Paper>

      {/* <AppBar
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
      </AppBar> */}

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
            <Typography
              sx={{
                flexGrow: '1'
              }}
            >
              <strong>Sampling Sites</strong>
            </Typography>
            <Button
              sx={{
                mr: -1
              }}
              variant="contained"
              color="primary"
              startIcon={
                <Icon path={mdiPlus} size={1} />
              }>
              Add
            </Button>
          </Toolbar>
          <Box
            display="flex"
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
            <Box 
              display="flex" 
              flex="1 1 auto"
              alignItems="center"
              justifyContent="center">
              <Typography variant='body2'>No Sampling Sites</Typography>
            </Box>

            <Accordion
              square
              disableGutters
              sx={{
                display: 'none',
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
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Sampling Site 1</Typography>
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
                display: 'none',
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
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>Sampling Site 1</Typography>
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
              Import
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => observationsContext.createNewRecord()}>
              Add Record
            </Button>
            <Button
              variant="outlined"
              sx={{
                mr: -1
              }}
              startIcon={
                <Icon path={mdiCogOutline} size={1} />
              }
            >
              Configure
            </Button>
          </Toolbar>

          <Box 
            display="flex" 
            flexDirection="column"
            flex="1 1 auto"
          >
            {/* Map View */}
            
            {/* <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              flex="1 1 auto"
              sx={{
                backgroundColor: grey[100]
              }}
            >
              <Typography variant='body2'>Map View</Typography>
            </Box> */}

            {/* Table View */}
            <Box 
              display="flex"
              flex="1 1 auto"
              flexDirection="column"
            >
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
              <ObservationsTable />
              </Box>
            </Box>
          
          </Box>

        </Box>
      </Box>
    </Box>

  );
};
