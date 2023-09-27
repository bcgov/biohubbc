import { mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuProps
} from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { getCodesName } from 'utils/Utils';

export const SamplingSiteList = () => {
  const history = useHistory();
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);
  codesContext.codesDataLoader.load();

  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
    setAnchorEl(event.currentTarget);
    // setEditData({ ...values.methods[index], index });
  };

  if (
    !surveyContext.sampleSiteDataLoader.data ||
    (surveyContext.sampleSiteDataLoader.isLoading && !codesContext.codesDataLoader.data) ||
    codesContext.codesDataLoader.isLoading
  ) {
    return <CircularProgress color="inherit" />;
  }

  return (
    <>
      <Menu
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}>
        <MenuItem onClick={() => console.log('EDIT THIS SAMPLING SITE')}>
          <ListItemIcon>
            <Icon path={mdiPencilOutline} size={1} />
          </ListItemIcon>
          Edit Details
        </MenuItem>
        <MenuItem onClick={() => console.log('DELETE THIS SAMPLING SITE')}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          Remove
        </MenuItem>
      </Menu>
      <Box display="flex" flexDirection="column" height="100%">
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
            onClick={() => {
              history.push('sampling');
            }}
            startIcon={<Icon path={mdiPlus} size={1} />}>
            Add
          </Button>
        </Toolbar>
        <Box
          sx={{
            overflowY: 'scroll',
            background: grey[50],
            '& .MuiAccordion-root + .MuiAccordion-root': {
              borderTopStyle: 'solid',
              borderTopWidth: '1px',
              borderTopColor: grey[300]
            }
          }}>
          {!surveyContext.sampleSiteDataLoader.data.sampleSites.length && (
            <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center">
              <Typography variant="body2">No Sampling Sites</Typography>
            </Box>
          )}

          {surveyContext.sampleSiteDataLoader.data.sampleSites.map((sampleSite, index) => {
            return (
              <Accordion
                square
                disableGutters
                sx={{
                  boxShadow: 'none'
                }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" py={1} px={3}>
                  <AccordionSummary sx={{ width: '100%' }} aria-controls="panel1bh-content">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {sampleSite.name}
                    </Typography>
                  </AccordionSummary>
                  <IconButton
                    onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleMenuClick(event, index)}
                    aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <AccordionDetails
                  sx={{
                    pt: 0
                  }}>
                  <List component="div" disablePadding>
                    {sampleSite.sample_methods?.map((sampleMethod) => {
                      return (
                        <ListItem>
                          <ListItemText>
                            <Typography
                              sx={{
                                background: grey[200],
                                p: 1
                              }}
                              variant="body2">
                              {getCodesName(
                                codesContext.codesDataLoader.data,
                                'sample_methods',
                                sampleMethod.method_lookup_id
                              )}
                            </Typography>
                            <List disablePadding>
                              {sampleMethod.sample_periods?.map((samplePeriod) => {
                                return (
                                  <ListItem>
                                    <ListItemText>
                                      <Typography variant="body2">
                                        {samplePeriod.start_date} to {samplePeriod.end_date}
                                      </Typography>
                                    </ListItemText>
                                  </ListItem>
                                );
                              })}
                            </List>
                          </ListItemText>
                        </ListItem>
                      );
                    })}
                  </List>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </Box>
    </>
  );
};
