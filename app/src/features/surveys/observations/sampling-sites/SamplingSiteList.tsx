import { mdiDotsVertical, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getCodesName } from 'utils/Utils';

const SamplingSiteList = () => {
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  surveyContext.sampleSiteDataLoader.load(surveyContext.projectId, surveyContext.surveyId);

  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [selectedSampleSiteId, setSelectedSampleSiteId] = useState<number | undefined>();

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, sample_site_id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedSampleSiteId(sample_site_id);
  };

  if (
    !surveyContext.sampleSiteDataLoader.data ||
    (surveyContext.sampleSiteDataLoader.isLoading && !codesContext.codesDataLoader.data) ||
    codesContext.codesDataLoader.isLoading
  ) {
    // TODO Fix styling: spinner loads in the corner of the component
    return <CircularProgress size={40} />;
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
        <MenuItem component={RouterLink} to={`sampling/${selectedSampleSiteId}/edit`}>
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
            component={RouterLink}
            to={'sampling'}
            startIcon={<Icon path={mdiPlus} size={1} />}>
            Add
          </Button>
        </Toolbar>
        <Box
          position="relative"
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
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%'
            }}>
            {!surveyContext.sampleSiteDataLoader.data.sampleSites.length && (
              <Box display="flex" flex="1 1 auto" height="100%" alignItems="center" justifyContent="center">
                <Typography variant="body2">No Sampling Sites</Typography>
              </Box>
            )}

            {surveyContext.sampleSiteDataLoader.data.sampleSites.map((sampleSite, index) => {
              return (
                <Accordion
                  square
                  disableGutters
                  key={`${sampleSite.survey_sample_site_id}-${sampleSite.name}`}
                  sx={{
                    boxShadow: 'none',
                    '&:before': {
                      display: 'none'
                    }
                  }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" py={1} px={3}>
                    <AccordionSummary
                      sx={{
                        p: 0
                      }}
                      aria-controls="panel1bh-content">
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {sampleSite.name}
                      </Typography>
                    </AccordionSummary>
                    <IconButton
                      edge="end"
                      onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                        handleMenuClick(event, sampleSite.survey_sample_site_id)
                      }
                      aria-label="settings">
                      <Icon path={mdiDotsVertical} size={1}></Icon>
                    </IconButton>
                  </Box>
                  <AccordionDetails
                    sx={{
                      pt: 0
                    }}>
                    <List component="div" disablePadding>
                      {sampleSite.sample_methods?.map((sampleMethod) => {
                        return (
                          <ListItem
                            key={`${sampleMethod.survey_sample_site_id}-${sampleMethod.survey_sample_method_id}`}
                            sx={{
                              background: grey[200]
                            }}>
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
                                    <ListItem
                                      key={`${samplePeriod.survey_sample_method_id}-${samplePeriod.survey_sample_period_id}`}>
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
      </Box>
    </>
  );
};

export default SamplingSiteList;
