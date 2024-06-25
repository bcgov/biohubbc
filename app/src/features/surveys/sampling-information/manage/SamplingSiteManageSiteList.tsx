import { mdiDotsVertical, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { SkeletonMap, SkeletonTable } from 'components/loading/SkeletonLoaders';
import { SamplingSiteCard } from 'features/surveys/sampling-information/manage/SamplingSiteCard';
import { SamplingSiteMapContainer } from 'features/surveys/sampling-information/manage/SamplingSiteMapContainer';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Renders a list of sampling sites.
 *
 * @return {*}
 */
export const SamplingSiteManageSiteList = () => {
  const surveyContext = useSurveyContext();
  const codesContext = useCodesContext();
  const dialogContext = useDialogContext();
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const handleCheckboxChange = (sampleSiteId: number) => {
    setCheckboxSelectedIds((prev) => {
      if (prev.includes(sampleSiteId)) {
        return prev.filter((item) => item !== sampleSiteId);
      } else {
        return [...prev, sampleSiteId];
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

      <Paper component={Stack} flexDirection="column" height="100%">
        <Toolbar
          disableGutters
          sx={{
            flex: '0 0 auto',
            pr: 3,
            pl: 2
          }}>
          <Typography variant="h3" component="h2" flexGrow={1}>
            Sites &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({samplingSiteCount})
            </Typography>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to={'sampling/create'}
            startIcon={<Icon path={mdiPlus} size={0.8} />}>
            Add
          </Button>
          <IconButton
            edge="end"
            sx={{
              ml: 1
            }}
            aria-label="header-settings"
            disabled={!checkboxSelectedIds.length}
            onClick={handleHeaderMenuClick}
            title="Bulk Actions">
            <Icon path={mdiDotsVertical} size={1} />
          </IconButton>
        </Toolbar>
        <Divider flexItem />
        <Box>
          {surveyContext.sampleSiteDataLoader.isLoading || codesContext.codesDataLoader.isLoading ? (
            <>
              <SkeletonMap />
              <SkeletonTable numberOfLines={5} />
            </>
          ) : (
            <>
              <SamplingSiteMapContainer samplingSites={surveyContext.sampleSiteDataLoader.data?.sampleSites ?? []} />
              <Stack height="100%" sx={{ overflowY: 'auto' }}>
                <Box flex="0 0 auto" display="flex" alignItems="center" px={2} ml={1} height={55}>
                  <FormGroup>
                    <FormControlLabel
                      label={
                        <Typography
                          ml={-0.5}
                          variant="body2"
                          component="span"
                          color="textSecondary"
                          fontWeight={700}
                          sx={{ textTransform: 'uppercase' }}>
                          Select All
                        </Typography>
                      }
                      control={
                        <Checkbox
                          sx={{
                            mr: 0.75
                          }}
                          checked={checkboxSelectedIds.length > 0 && checkboxSelectedIds.length === samplingSiteCount}
                          indeterminate={
                            checkboxSelectedIds.length >= 1 && checkboxSelectedIds.length < samplingSiteCount
                          }
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
                <Stack
                  flex="1 1 auto"
                  sx={{
                    background: grey[100]
                  }}>
                  {surveyContext.sampleSiteDataLoader.data?.sampleSites.map((sampleSite) => {
                    return (
                      <SamplingSiteCard
                        sampleSite={sampleSite}
                        handleCheckboxChange={handleCheckboxChange}
                        handleMenuClick={(event) => {
                          setSampleSiteAnchorEl(event.currentTarget);
                          setSelectedSampleSiteId(sampleSite.survey_sample_site_id);
                        }}
                        key={sampleSite.survey_sample_site_id}
                      />
                    );
                  })}
                </Stack>
              </Stack>
            </>
          )}
        </Box>
      </Paper>
    </>
  );
};
