import { mdiCog, mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
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
import TablePagination from '@mui/material/TablePagination';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { SamplingSiteListSite } from 'features/surveys/observations/sampling-sites/site/SamplingSiteListSite';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useObservationsPageContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';

const pageSizeOptions = [10, 25, 50];

/**
 * Renders a list of sampling sites.
 *
 * @return {*}
 */
export const SamplingSiteListContainer = () => {
  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();
  const observationsPageContext = useObservationsPageContext();
  const biohubApi = useBiohubApi();

  const [sampleSiteAnchorEl, setSampleSiteAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [headerAnchorEl, setHeaderAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [selectedSampleSiteId, setSelectedSampleSiteId] = useState<number | undefined>();
  const [checkboxSelectedIds, setCheckboxSelectedIds] = useState<number[]>([]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[1]
  });
  const [sortModel] = useState<GridSortModel>([]);

  const sampleSiteDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.samplingSite.getSampleSites(surveyContext.projectId, surveyContext.surveyId, pagination)
  );

  const pagination: ApiPaginationRequestOptions = useMemo(() => {
    const sort = firstOrNull(sortModel);

    return {
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,

      // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
      page: paginationModel.page + 1
    };
  }, [sortModel, paginationModel]);

  // Refresh survey list when pagination or sort changes
  useEffect(() => {
    sampleSiteDataLoader.refresh(pagination);

    // Adding a DataLoader as a dependency causes an infinite rerender loop if a useEffect calls `.refresh`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination]);

  const sampleSites = sampleSiteDataLoader.data?.sampleSites ?? [];

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
        sampleSiteDataLoader.refresh(pagination);
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
        sampleSiteDataLoader.refresh(pagination);
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

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPaginationModel({ page: 0, pageSize: parseInt(event.target.value, 10) });
  };

  const handleChangePage = (_: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPaginationModel((model) => ({ ...model, page: newPage }));
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

  const samplingSiteCount = useMemo(
    () => sampleSiteDataLoader.data?.pagination.total ?? 0,
    [sampleSites, sampleSiteDataLoader.data]
  );

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
        <MenuItem onClick={handlePromptConfirmBulkDelete} disabled={observationsPageContext.isDisabled}>
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
        }}>
        <Toolbar
          disableGutters
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
            to={'sampling'}
            startIcon={<Icon path={mdiCog} size={0.8} />}
            disabled={observationsPageContext.isDisabled}>
            Manage
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
        <Box position="relative" display="flex" alignItems="center" px={2} height={55}>
          <FormGroup>
            <FormControlLabel
              label={
                <Typography
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
        <Divider flexItem />
        <Box position="relative" display="flex" flex="1 1 auto" overflow="hidden">
          {sampleSiteDataLoader.isLoading ? (
            <SkeletonList />
          ) : (
            <Stack height="100%" width="100%" position="absolute" sx={{ overflowY: 'auto' }}>
              <Box
                flex="1 1 auto"
                sx={{
                  background: grey[100]
                }}>
                {/* Display text if the sample site data loader has no items in it */}
                {!sampleSiteDataLoader.data?.sampleSites.length && (
                  <Stack
                    sx={{
                      background: grey[100]
                    }}
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

                {sampleSiteDataLoader.data?.sampleSites.map((sampleSite) => {
                  return (
                    <SamplingSiteListSite
                      sampleSite={sampleSite}
                      isChecked={checkboxSelectedIds.includes(sampleSite.survey_sample_site_id)}
                      handleSampleSiteMenuClick={handleSampleSiteMenuClick}
                      handleCheckboxChange={handleCheckboxChange}
                      key={`${sampleSite.survey_sample_site_id}-${sampleSite.name}`}
                    />
                  );
                })}
              </Box>
            </Stack>
          )}
        </Box>
        {/* Pagination control */}
        <Paper square sx={{ bottom: 0, marginTop: '-1px', width: '100%', maxWidth: '100%', zIndex: 99 }}>
          <Divider flexItem />
          <TablePagination
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'space-between',
              '& .MuiTablePagination-toolbar': { width: '100%' },
              '& .MuiTablePagination-displayedRows': { minWidth: '125px', textAlign: 'right' }
            }}
            labelRowsPerPage="Rows:"
            rowsPerPage={paginationModel.pageSize}
            page={paginationModel.page}
            onPageChange={handleChangePage}
            rowsPerPageOptions={pageSizeOptions}
            onRowsPerPageChange={handleChangeRowsPerPage}
            count={sampleSiteDataLoader.data?.pagination.total ?? 0}
          />
        </Paper>
      </Paper>
    </>
  );
};
