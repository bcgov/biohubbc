import { mdiDotsVertical, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router';

export const SamplingSiteList = () => {
  const history = useHistory();

  return (
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
        }}>
        <Typography
          sx={{
            flexGrow: '1'
          }}>
          <strong>Sampling Sites</strong>
        </Typography>
        <Button
          sx={{
            mr: -1
          }}
          variant="contained"
          color="primary"
          action={() => {
            history.push('sampling');
          }}
          startIcon={<Icon path={mdiPlus} size={1} />}>
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
        }}>
        <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center">
          <Typography variant="body2">No Sampling Sites</Typography>
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
              }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Sampling Site 1
              </Typography>
            </AccordionSummary>
            <IconButton edge="end">
              <Icon path={mdiDotsVertical} size={1}></Icon>
            </IconButton>
          </Box>
          <AccordionDetails
            sx={{
              pt: 0
            }}>
            <List component="div" disablePadding>
              <ListItem
                sx={{
                  background: grey[200]
                }}>
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
              }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Sampling Site 1
              </Typography>
            </AccordionSummary>
            <IconButton edge="end">
              <Icon path={mdiDotsVertical} size={1}></Icon>
            </IconButton>
          </Box>
          <AccordionDetails
            sx={{
              pt: 0
            }}>
            <List disablePadding>
              <ListItem
                sx={{
                  background: grey[200]
                }}>
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
  );
};
