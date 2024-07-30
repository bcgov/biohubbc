import { mdiDotsVertical, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonMap, SkeletonTable } from 'components/loading/SkeletonLoaders';
import { SamplingSiteMapContainer } from 'features/surveys/sampling-information/sites/manage/SamplingSiteMapContainer';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SamplingSiteManageMethodTable } from './table/method/SamplingSiteManageMethodTable';
import { SamplingSiteManagePeriodTable } from './table/period/SamplingSiteManagePeriodTable';
import {
    ISamplingSiteCount,
    SamplingSiteManageTableToolbar,
    SamplingSiteManageTableView
} from './table/SamplingSiteManageTableToolbar';
import { SamplingSiteManageSiteTable } from './table/site/SamplingSiteManageSiteTable';

/**
 * Renders a list of sampling sites.
 *
 * @return {*}
 */
export const SamplingSiteManageContainer = () => {
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

  const [siteSelection, setSiteSelection] = useState<GridRowSelectionModel>([]);
  const [methodSelection, setMethodSelection] = useState<GridRowSelectionModel>([]);
  const [periodSelection, setPeriodSelection] = useState<GridRowSelectionModel>([]);

  const [activeView, setActiveView] = useState<SamplingSiteManageTableView>(SamplingSiteManageTableView.SITES);

  console.log(setSelectedSampleSiteId);

  const sampleSites = surveyContext.sampleSiteDataLoader.data;
  const sampleMethods = sampleSites?.sampleSites.flatMap((site) => site.sample_methods);
  const samplePeriods = sampleMethods?.flatMap((method) => method.sample_periods);

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
  const handleBulkDelete = async () => {
    let deleteApiCall: Promise<void>;
    const selectedIds = activeView === SamplingSiteManageTableView.SITES
      ? siteSelection
      : activeView === SamplingSiteManageTableView.TECHNIQUES
      ? methodSelection
      : periodSelection;
  
    if (activeView === SamplingSiteManageTableView.SITES) {
      deleteApiCall = biohubApi.samplingSite.deleteSampleSites(
        surveyContext.projectId,
        surveyContext.surveyId,
        selectedIds as number[] // Cast to number[] for API call
      );
    } else if (activeView === SamplingSiteManageTableView.TECHNIQUES) {
      deleteApiCall = biohubApi.samplingSite.deleteSampleMethods(
        surveyContext.projectId,
        surveyContext.surveyId,
        selectedIds as number[]
      );
    } else if (activeView === SamplingSiteManageTableView.PERIODS) {
      deleteApiCall = biohubApi.samplingSite.deleteSamplePeriods(
        surveyContext.projectId,
        surveyContext.surveyId,
        selectedIds as number[]
      );
    } else {
      // If no valid view is selected, return early
      return;
    }
  
    await deleteApiCall
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setSiteSelection([]); // Clear selection based on the active view
        setMethodSelection([]);
        setPeriodSelection([]);
        setHeaderAnchorEl(null);
        surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setSiteSelection([]);
        setMethodSelection([]);
        setPeriodSelection([]);
        setHeaderAnchorEl(null);
        dialogContext.setSnackbar({
          snackbarMessage: (
            <>
              <Typography variant="body2" component="div">
                <strong>Error Deleting Items</strong>
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

  const handleRowSelection = (selection: GridRowSelectionModel) => {
    switch (activeView) {
      case SamplingSiteManageTableView.SITES:
        setSiteSelection(selection);
        break;
      case SamplingSiteManageTableView.TECHNIQUES:
        setMethodSelection(selection);
        break;
      case SamplingSiteManageTableView.PERIODS:
        setPeriodSelection(selection);
        break;
    }
  };
  

  const samplingSiteCount = sampleSites?.pagination.total ?? 0;

  const counts: ISamplingSiteCount[] = [
    { type: SamplingSiteManageTableView.SITES, value: samplingSiteCount },
    { type: SamplingSiteManageTableView.TECHNIQUES, value: sampleMethods?.length ?? 0 },
    { type: SamplingSiteManageTableView.PERIODS, value: samplePeriods?.length ?? 0 }
  ];

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

      <Paper>
        <Toolbar
          sx={{
            flex: '0 0 auto',
            pr: 3,
            pl: 2
          }}>
          <Typography variant="h3" component="h2" flexGrow={1}>
            Sampling Sites &zwnj;
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
          <LoadingGuard
            isLoading={surveyContext.sampleSiteDataLoader.isLoading || codesContext.codesDataLoader.isLoading}
            fallback={
              <>
                <SkeletonMap />
                <SkeletonTable numberOfLines={5} />
              </>
            }
            delay={200}>
            {/* MAP */}
            <SamplingSiteMapContainer samplingSites={sampleSites?.sampleSites ?? []} />

            {/* TABS FOR TABLE VIEWS */}
            <SamplingSiteManageTableToolbar activeView={activeView} setActiveView={setActiveView} counts={counts} />

            {/* SITES */}
            {activeView === SamplingSiteManageTableView.SITES && sampleSites && (
              <SamplingSiteManageSiteTable
                sites={sampleSites}
                handleRowSelection={handleRowSelection}
                rowSelectionModel={siteSelection}
              />
            )}

            {/* TECHNIQUES */}
            {activeView === SamplingSiteManageTableView.TECHNIQUES && sampleSites && (
              <SamplingSiteManageMethodTable
                sites={sampleSites}
                handleRowSelection={handleRowSelection}
                rowSelectionModel={methodSelection}
              />
            )}

            {/* PERIODS */}
            {activeView === SamplingSiteManageTableView.PERIODS && sampleSites && (
              <SamplingSiteManagePeriodTable
                sites={sampleSites}
                handleRowSelection={handleRowSelection}
                rowSelectionModel={periodSelection}
              />
            )}
          </LoadingGuard>
        </Box>
      </Paper>
    </>
  );
};
