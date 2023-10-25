import {
  mdiCalendarRange,
  mdiChevronDown,
  mdiDotsVertical,
  mdiPencilOutline,
  mdiPlus,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getCodesName } from 'utils/Utils';

const SampleSiteSkeleton = () => (
  <Box
    sx={{
      display: 'flex',
      gap: '16px',
      py: 1.5,
      px: 2,
      height: '52px',
      borderBottom: '1px solid ' + grey[300]
    }}>
    <Skeleton sx={{ flex: '1 1 auto' }} />
  </Box>
);

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

  const samplingSiteCount = surveyContext.sampleSiteDataLoader.data?.sampleSites.length ?? 0;

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
        <MenuItem
          sx={{
            p: 0,
            '& a': {
              display: 'flex',
              px: 2,
              py: '6px',
              textDecoration: 'none',
              color: 'text.primary',
              borderRadius: 0,
              '&:focus': {
                outline: 'none'
              }
            }
          }}>
          <RouterLink to={`sampling/${selectedSampleSiteId}/edit`}>
            <ListItemIcon>
              <Icon path={mdiPencilOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Edit Details</ListItemText>
          </RouterLink>
        </MenuItem>
        <MenuItem onClick={() => console.log('DELETE THIS SAMPLING SITE')}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
      <Box display="flex" flexDirection="column" height="100%">
        <Toolbar
          sx={{
            flex: '0 0 auto'
          }}>
          <Typography
            sx={{
              flexGrow: '1',
              fontSize: '1.125rem',
              fontWeight: 700
            }}>
            Sampling Sites &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({samplingSiteCount})
            </Typography>
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
        <Box position="relative" display="flex" flex="1 1 auto" overflow="hidden">
          {/* Display spinner if data loaders are still waiting for a response */}
          <Fade
            in={surveyContext.sampleSiteDataLoader.isLoading || codesContext.codesDataLoader.isLoading}
            timeout={1000}>
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                p: 1,
                background: grey[100],
                zIndex: 2
              }}>
              <SampleSiteSkeleton />
              <SampleSiteSkeleton />
              <SampleSiteSkeleton />
              <SampleSiteSkeleton />
              <SampleSiteSkeleton />
            </Box>
          </Fade>

          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              p: 1,
              background: grey[100]
            }}>
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
                  key={`${sampleSite.survey_sample_site_id}-${sampleSite.name}`}
                  sx={{
                    boxShadow: 'none'
                  }}>
                  <Box
                    display="flex"
                    overflow="hidden"
                    alignItems="center"
                    pr={1.5}
                    height={55}
                    className="sampleSiteHeader">
                    <AccordionSummary
                      expandIcon={<Icon path={mdiChevronDown} size={1} />}
                      aria-controls="panel1bh-content"
                      sx={{
                        flex: '1 1 auto',
                        overflow: 'hidden',
                        py: 0.25,
                        pr: 1.5,
                        pl: 2,
                        gap: '24px',
                        '& .MuiAccordionSummary-content': {
                          flex: '1 1 auto',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap'
                        }
                      }}>
                      <Typography
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          typography: 'body2',
                          fontWeight: 700,
                          fontSize: '0.9rem'
                        }}>
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
                      px: 2
                    }}>
                    <List
                      disablePadding
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.9rem'
                        }
                      }}>
                      {sampleSite.sample_methods?.map((sampleMethod) => {
                        return (
                          <ListItem
                            disableGutters
                            key={`${sampleMethod.survey_sample_site_id}-${sampleMethod.survey_sample_method_id}`}
                            sx={{
                              display: 'block',
                              py: 0
                            }}>
                            <ListItemText
                              primary={getCodesName(
                                codesContext.codesDataLoader.data,
                                'sample_methods',
                                sampleMethod.method_lookup_id
                              )}
                              sx={{
                                m: 0,
                                px: 2,
                                py: 1.25,
                                backgroundColor: grey[100]
                              }}></ListItemText>
                            <List disablePadding>
                              {sampleMethod.sample_periods?.map((samplePeriod) => {
                                return (
                                  <ListItem
                                    divider
                                    key={`${samplePeriod.survey_sample_method_id}-${samplePeriod.survey_sample_period_id}`}>
                                    <ListItemIcon>
                                      <Icon path={mdiCalendarRange} size={1}></Icon>
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={`${samplePeriod.start_date} to ${samplePeriod.end_date}`}></ListItemText>
                                  </ListItem>
                                );
                              })}
                            </List>
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
