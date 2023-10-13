import { mdiChevronDown, mdiDotsVertical, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
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

  useEffect(() => {
    surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  }, []);

  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [selectedSampleSiteId, setSelectedSampleSiteId] = useState<number | undefined>();

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, sample_site_id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedSampleSiteId(sample_site_id);
  };

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
              flexGrow: '1',
              fontSize: '1.125rem',
              fontWeight: 700
            }}>
            Sampling Sites
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
              height: '100%',
              p: 1
            }}>
            {/* Display spinner if data loaders are still waiting for a response */}
            {(surveyContext.sampleSiteDataLoader.isLoading || codesContext.codesDataLoader.isLoading) && (
              <Box display="flex" flex="1 1 auto" m={1} alignItems="center" justifyContent="center">
                <CircularProgress size={40} />
              </Box>
            )}

            {/* Display text if the sample site data loader has no items in it */}
            {!surveyContext.sampleSiteDataLoader.data?.sampleSites.length &&
              !surveyContext.sampleSiteDataLoader.isLoading && (
                <Box display="flex" flex="1 1 auto" height="100%" alignItems="center" justifyContent="center">
                  <Typography variant="body2">No Sampling Sites</Typography>
                </Box>
              )}
            {surveyContext.sampleSiteDataLoader.data?.sampleSites.map((sampleSite, index) => {
              return (
                <Accordion
                  sx={{
                    boxShadow: 'none'
                  }}
                  key={`${sampleSite.survey_sample_site_id}-${sampleSite.name}`}>
                  <Box
                    display="flex"
                    overflow="hidden"
                    alignItems="center"
                    pr={1.5}
                    sx={{
                      background: grey[50]
                    }}>
                    <AccordionSummary
                      expandIcon={<Icon path={mdiChevronDown} size={1} />}
                      aria-controls="panel1bh-content"
                      sx={{
                        flex: '1 1 auto',
                        overflow: 'hidden',
                        py: 0.25,
                        pr: 1.5,
                        gap: '16px',
                        '& .MuiAccordionSummary-content': {
                          flex: '1 1 auto',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }
                      }}>
                      <Typography sx={{ overflow: 'hidden', fontWeight: 700, textOverflow: 'ellipsis' }}>
                        {sampleSite.name}
                      </Typography>
                    </AccordionSummary>
                    <IconButton
                      onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                        handleMenuClick(event, sampleSite.survey_sample_site_id)
                      }
                      aria-label="settings">
                      <Icon path={mdiDotsVertical} size={1}></Icon>
                    </IconButton>
                  </Box>
                  <AccordionDetails
                    sx={{
                      pt: 0,
                      pb: 0
                    }}>
                    <List disablePadding>
                      {sampleSite.sample_methods?.map((sampleMethod) => {
                        return (
                          <>
                            <ListItem
                              disableGutters
                              divider
                              key={`${sampleMethod.survey_sample_site_id}-${sampleMethod.survey_sample_method_id}`}
                              sx={{
                                display: 'block'
                              }}>
                              <ListItemText
                                primary={getCodesName(
                                  codesContext.codesDataLoader.data,
                                  'sample_methods',
                                  sampleMethod.method_lookup_id
                                )}></ListItemText>
                              <List disablePadding>
                                {sampleMethod.sample_periods?.map((samplePeriod) => {
                                  return (
                                    <ListItem
                                      divider
                                      key={`${samplePeriod.survey_sample_method_id}-${samplePeriod.survey_sample_period_id}`}>
                                      <ListItemText>
                                        <Typography variant="body2" color="textSecondary">
                                          {samplePeriod.start_date} to {samplePeriod.end_date}
                                        </Typography>
                                      </ListItemText>
                                    </ListItem>
                                  );
                                })}
                              </List>
                            </ListItem>
                          </>
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
