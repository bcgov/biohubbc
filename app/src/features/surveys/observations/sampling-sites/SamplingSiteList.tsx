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
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { CodesContext } from 'contexts/codesContext';
import { DialogContext } from 'contexts/dialogContext';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getCodesName } from 'utils/Utils';

const SamplingSiteList = () => {
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);
  const dialogContext = useContext(DialogContext);
  const biohubApi = useBiohubApi();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [selectedSampleSiteId, setSelectedSampleSiteId] = useState<number | undefined>();

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, sample_site_id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedSampleSiteId(sample_site_id);
  };

  /**
   * Handle the delete sampling site API call.
   *
   */
  const handleDeleteSampleSite = async () => {
    await biohubApi.samplingSite
      .deleteSampleSite(surveyContext.projectId, surveyContext.surveyId, Number(selectedSampleSiteId))
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setAnchorEl(null);
        surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setAnchorEl(null);
        dialogContext.setSnackbar({
          snackbarMessage: (
            <>
              <Typography variant="body2" component="div">
                <strong>Error Deleting Sampling Site</strong>
              </Typography>
              <Typography variant="body2" component="div">
                {String(error)}
              </Typography>
            </>
          ),
          open: true
        });
      });
  };

  /**
   * Display the delete sampling site dialog.
   *
   */
  const deleteSampleSiteDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Sampling Site?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Are you sure you want to delete this sampling site?
        </Typography>
      ),
      yesButtonLabel: 'Delete Sampling Site',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'error' },
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      open: true,
      onYes: () => {
        handleDeleteSampleSite();
      }
    });
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
        <MenuItem onClick={deleteSampleSiteDialog}>
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
          {surveyContext.sampleSiteDataLoader.isLoading || codesContext.codesDataLoader.isLoading ? (
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                p: 1,
                pt: 0,
                background: '#fff',
                zIndex: 2
              }}>
              <SkeletonList
                isLoading={surveyContext.sampleSiteDataLoader.isLoading || codesContext.codesDataLoader.isLoading}
              />
            </Box>
          ) : (
            <Box
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                overflowY: 'auto',
                p: 1,
                pt: 0
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
                    disableGutters
                    square
                    key={`${sampleSite.survey_sample_site_id}-${sampleSite.name}`}
                    sx={{
                      boxShadow: 'none',
                      borderTop: '1px solid #ccc',
                      '&:before': {
                        display: 'none'
                      }
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
                        px: 1
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
                                p: 0,
                                '& + li': {
                                  mt: 1.5
                                }
                              }}>
                              <ListItemText
                                sx={{
                                  px: 2,
                                  py: 1,
                                  background: grey[100]
                                }}
                                title="Sampling Method"
                                primary={getCodesName(
                                  codesContext.codesDataLoader.data,
                                  'sample_methods',
                                  sampleMethod.method_lookup_id
                                )}></ListItemText>
                              <List disablePadding>
                                {sampleMethod.sample_periods?.map((samplePeriod) => {
                                  return (
                                    <ListItem
                                      dense
                                      divider
                                      disableGutters
                                      sx={{
                                        px: 1.5,
                                        color: 'text.secondary'
                                      }}
                                      title="Sampling Period"
                                      key={`${samplePeriod.survey_sample_method_id}-${samplePeriod.survey_sample_period_id}`}>
                                      <ListItemIcon sx={{ minWidth: '32px' }} color="inherit">
                                        <Icon path={mdiCalendarRange} size={0.75}></Icon>
                                      </ListItemIcon>
                                      <ListItemText>
                                        <Typography variant="body2" component="div" color="inherit">
                                          {`${samplePeriod.start_date} ${samplePeriod.start_time ?? ''} - ${
                                            samplePeriod.end_date
                                          } ${samplePeriod.end_time ?? ''}`}
                                        </Typography>
                                      </ListItemText>
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
          )}
        </Box>
      </Box>
    </>
  );
};

export default SamplingSiteList;
