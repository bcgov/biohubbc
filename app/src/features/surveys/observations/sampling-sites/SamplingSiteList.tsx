import {
  mdiCalendarRange,
  mdiChevronDown,
  mdiDotsVertical,
  mdiPencilOutline,
  mdiPlus,
  mdiTrashCanOutline
} from '@mdi/js';
import Icon from '@mdi/react';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
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
import Stack from '@mui/material/Stack';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';

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

  const [sampleSiteAnchorEl, setSampleSiteAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [headerAnchorEl, setHeaderAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [selectedSampleSiteId, setSelectedSampleSiteId] = useState<number | undefined>();
  const [checkboxSelectedIds, setCheckboxSelectedIds] = useState<number[]>([]);

  const sampleSites = surveyContext.sampleSiteDataLoader.data?.sampleSites ?? [];

  const handleSampleSiteMenuClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    sample_site_id: number
  ) => {
    setSampleSiteAnchorEl(event.currentTarget);
    setSelectedSampleSiteId(sample_site_id);
  };

  const handleHeaderMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setHeaderAnchorEl(event.currentTarget);
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
        setSampleSiteAnchorEl(null);
        surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setSampleSiteAnchorEl(null);
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

  const handleCheckboxChange = (sampleSiteId: number) => {
    setCheckboxSelectedIds((prev) => {
      if (prev.includes(sampleSiteId)) {
        return prev.filter((item) => item !== sampleSiteId);
      } else {
        return [...prev, sampleSiteId];
      }
    });
  };

  const handleBulkDeleteSampleSites = async () => {
    await biohubApi.samplingSite
      .deleteSampleSites(surveyContext.projectId, surveyContext.surveyId, checkboxSelectedIds)
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setCheckboxSelectedIds([]);
        setHeaderAnchorEl(null);
        surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setCheckboxSelectedIds([]);
        setHeaderAnchorEl(null);
        dialogContext.setSnackbar({
          snackbarMessage: (
            <>
              <Typography variant="body2" component="div">
                <strong>Error Deleting Sampling Sites</strong>
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

  const handlePromptConfirmBulkDelete = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Sampling Sites?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Are you sure you want to delete the selected sampling sites?
        </Typography>
      ),
      yesButtonLabel: 'Delete Sampling Sites',
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
        handleBulkDeleteSampleSites();
      }
    });
  };

  const samplingSiteCount = sampleSites.length ?? 0;

  return (
    <>
      <Menu
        open={Boolean(sampleSiteAnchorEl)}
        onClose={() => setSampleSiteAnchorEl(null)}
        anchorEl={sampleSiteAnchorEl}
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

      <Menu
        open={Boolean(headerAnchorEl)}
        onClose={() => setHeaderAnchorEl(null)}
        anchorEl={headerAnchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}>
        <MenuItem onClick={handlePromptConfirmBulkDelete}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Paper 
        component={Stack}
        flexDirection="column" 
        height="100%"
        sx={{
          overflow: 'hidden'
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            flex: '0 0 auto',
            pr: 3,
            pl: 2
          }}>
          <Typography
            variant="h3"
            component="h2"
            flexGrow={1}
          >
            Sampling Sites &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({samplingSiteCount})
            </Typography>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to={'sampling'}
            startIcon={<Icon path={mdiPlus} size={1} />}>
            Add
          </Button>
          <IconButton
            edge="end"
            sx={{
              ml: 1,
            }}
            aria-label="header-settings"
            disabled={!checkboxSelectedIds.length}
            onClick={handleHeaderMenuClick}>
            <Icon path={mdiDotsVertical} size={1} />
          </IconButton>
        </Toolbar>
        <Divider flexItem />
        <Box position="relative" display="flex" flex="1 1 auto" overflow="hidden">
          <Box position="absolute" top="0" right="0" bottom="0" left="0">
            {surveyContext.sampleSiteDataLoader.isLoading || codesContext.codesDataLoader.isLoading ? (
              <SkeletonList />
            ) : (
              <Stack height="100%"  position="relative">
                <Box
                  flex="0 0 auto"
                  display="flex"
                  alignItems="center"
                  px={2}
                  height={55}>
                  <FormGroup>
                    <FormControlLabel
                      label={
                        <Typography 
                          variant='body2' 
                          component="span" 
                          color="textSecondary"
                          fontWeight={700}
                        >
                          SELECT ALL
                        </Typography>
                      }
                      control={
                        <Checkbox
                          sx={{
                            mr: 0.75,
                          }}
                          checked={checkboxSelectedIds.length === samplingSiteCount}
                          indeterminate={checkboxSelectedIds.length >= 1 && checkboxSelectedIds.length < samplingSiteCount}
                          onClick={() => {
                            if (checkboxSelectedIds.length === samplingSiteCount) {
                              setCheckboxSelectedIds([]);
                              return;
                            }

                            const sampleSiteIds = sampleSites.map((sampleSite) => sampleSite.survey_sample_site_id);
                            setCheckboxSelectedIds(sampleSiteIds);
                          }}
                          inputProps={{ 'aria-label': 'controlled' }}
                        />
                      }
                    />
                  </FormGroup>
                </Box>
                <Divider flexItem></Divider>
                <Box
                  flex="1 1 auto"
                  overflow="hidden"
                >
                  {/* Display text if the sample site data loader has no items in it */}
                  {!surveyContext.sampleSiteDataLoader.data?.sampleSites.length &&
                    !surveyContext.sampleSiteDataLoader.isLoading && (
                      <Stack 
                        display="flex"
                        alignItems="center" 
                        justifyContent="center" 
                        flex="1 1 auto"
                        position="absolute"
                        top={0}
                        right={0}
                        left={0}
                        bottom={0}
                        height="100%">
                        <Typography variant="body2">No Sampling Sites</Typography>
                      </Stack>
                    )}

                  {surveyContext.sampleSiteDataLoader.data?.sampleSites.map((sampleSite, index) => {
                    return (
                      <Accordion
                        disableGutters
                        square
                        key={`${sampleSite.survey_sample_site_id}-${sampleSite.name}`}
                        sx={{
                          boxShadow: 'none',
                          borderBottom: '1px solid' + grey[300],
                          '&:before': {
                            display: 'none'
                          }
                        }}>
                        <Box
                          display="flex"
                          alignItems="center"
                          overflow="hidden">
                          <AccordionSummary
                            expandIcon={<Icon path={mdiChevronDown} size={1} />}
                            aria-controls="panel1bh-content"
                            sx={{
                              flex: '1 1 auto',
                              py: 0,
                              pr: 8.5,
                              pl: 0,
                              height: 55,
                              overflow: 'hidden',
                              '& .MuiAccordionSummary-content': {
                                flex: '1 1 auto',
                                py: 0,
                                pl: 0,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                              }
                            }}>
                            <Stack flexDirection="row" alignItems="center"
                              sx={{
                                gap: 0.75,
                                pl: 2,
                                pr: 2,
                                overflow: "hidden"
                              }}
                            >
                              <Checkbox
                                edge="start"
                                checked={checkboxSelectedIds.includes(sampleSite.survey_sample_site_id)}
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleCheckboxChange(sampleSite.survey_sample_site_id);
                                }}
                                inputProps={{ 'aria-label': 'controlled' }}
                              />

                              <Typography variant="body2" component='div'
                                sx={{
                                  flex: '1 1 auto',
                                  fontWeight: 700,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                {sampleSite.name}
                              </Typography>

                            </Stack>
                          </AccordionSummary>
                          <IconButton
                            sx={{ position: 'absolute', right: '24px' }}
                            edge="end"
                            onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                              handleSampleSiteMenuClick(event, sampleSite.survey_sample_site_id)
                            }
                            aria-label="sample-site-settings">
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
                                typography: 'body2'
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
                                    )}
                                  />
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
                                              {`${samplePeriod.start_date} ${samplePeriod.start_time ?? ''} - ${samplePeriod.end_date
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
              </Stack>
            )}
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default SamplingSiteList;
