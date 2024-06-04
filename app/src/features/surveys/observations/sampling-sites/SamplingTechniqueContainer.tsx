import { mdiDotsVertical, mdiPencilOutline, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { useCodesContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import SamplingTechniqueCardContainer from './SamplingTechniqueCardContainer';

/**
 * Renders a list of techniques.
 *
 * @return {*}
 */
const SamplingSiteTechniqueContainer = () => {
  const surveyContext = useSurveyContext();
  const codesContext = useCodesContext();
  const dialogContext = useDialogContext();
  // const biohubApi = useBiohubApi();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [techniqueAnchorEl, setTechniqueAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [headerAnchorEl, setHeaderAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [selectedTechniqueId, setSelectedTechniqueId] = useState<number | undefined>();
  const [checkboxSelectedIds, setCheckboxSelectedIds] = useState<number[]>([]);

  const techniqueDataLoaderData = surveyContext.techniqueDataLoader.data;

  const techniqueCount = techniqueDataLoaderData?.count ?? 0;
  const techniques = techniqueDataLoaderData?.techniques ?? [];

  const handleTechniqueMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, sample_site_id: number) => {
    setTechniqueAnchorEl(event.currentTarget);
    setSelectedTechniqueId(sample_site_id);
  };

  console.log(handleTechniqueMenuClick);

  const handleHeaderMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setHeaderAnchorEl(event.currentTarget);
  };

  /**
   * Handle the delete technique API call.
   *
   */
  const handleDeleteTechnique = async () => {
    // await biohubApi.samplingSite
    //   .deleteTechnique(surveyContext.projectId, surveyContext.surveyId, Number(selectedTechniqueId))
    //   .then(() => {
    //     dialogContext.setYesNoDialog({ open: false });
    //     setTechniqueAnchorEl(null);
    //     surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    //   })
    //   .catch((error: any) => {
    //     dialogContext.setYesNoDialog({ open: false });
    //     setTechniqueAnchorEl(null);
    //     dialogContext.setSnackbar({
    //       snackbarMessage: (
    //         <>
    //           <Typography variant="body2" component="div">
    //             <strong>Error Deleting Technique</strong>
    //           </Typography>
    //           <Typography variant="body2" component="div">
    //             {String(error)}
    //           </Typography>
    //         </>
    //       ),
    //       open: true
    //     });
    //   });
  };

  /**
   * Display the delete technique dialog.
   *
   */
  const deleteTechniqueDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Technique?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Are you sure you want to delete this technique?
        </Typography>
      ),
      yesButtonLabel: 'Delete Technique',
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
        handleDeleteTechnique();
      }
    });
  };

  const handleCheckboxChange = (techniqueId: number) => {
    setCheckboxSelectedIds((prev) => {
      if (prev.includes(techniqueId)) {
        return prev.filter((item) => item !== techniqueId);
      } else {
        return [...prev, techniqueId];
      }
    });
  };

  console.log(handleCheckboxChange);

  const handleBulkDeleteTechniques = async () => {
    // await biohubApi.samplingSite
    //   .deleteTechniques(surveyContext.projectId, surveyContext.surveyId, checkboxSelectedIds)
    //   .then(() => {
    //     dialogContext.setYesNoDialog({ open: false });
    //     setCheckboxSelectedIds([]);
    //     setHeaderAnchorEl(null);
    //     surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    //   })
    //   .catch((error: any) => {
    //     dialogContext.setYesNoDialog({ open: false });
    //     setCheckboxSelectedIds([]);
    //     setHeaderAnchorEl(null);
    //     dialogContext.setSnackbar({
    //       snackbarMessage: (
    //         <>
    //           <Typography variant="body2" component="div">
    //             <strong>Error Deleting Techniques</strong>
    //           </Typography>
    //           <Typography variant="body2" component="div">
    //             {String(error)}
    //           </Typography>
    //         </>
    //       ),
    //       open: true
    //     });
    //   });
  };

  const handlePromptConfirmBulkDelete = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Techniques?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Are you sure you want to delete the selected techniques?
        </Typography>
      ),
      yesButtonLabel: 'Delete Techniques',
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
        handleBulkDeleteTechniques();
      }
    });
  };

  return (
    <>
      <Menu
        open={Boolean(techniqueAnchorEl)}
        onClose={() => setTechniqueAnchorEl(null)}
        anchorEl={techniqueAnchorEl}
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
          <RouterLink to={`sampling/${selectedTechniqueId}/edit`}>
            <ListItemIcon>
              <Icon path={mdiPencilOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Edit Details</ListItemText>
          </RouterLink>
        </MenuItem>
        <MenuItem onClick={deleteTechniqueDialog}>
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
        }}>
        <Toolbar
          disableGutters
          sx={{
            flex: '0 0 auto',
            pr: 3,
            pl: 2
          }}>
          <Typography variant="h3" component="h2" flexGrow={1}>
            Sampling Techniques &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({techniqueCount})
            </Typography>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to={'manage-sampling/technique/create'}
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
        {surveyContext.techniqueDataLoader.isLoading || codesContext.codesDataLoader.isLoading ? (
          <SkeletonList />
        ) : (
          <Stack height="100%" position="relative" sx={{ overflowY: 'auto' }}>
            <Divider flexItem></Divider>
            <Box
              flex="1 1 auto"
              sx={{
                background: grey[100]
              }}>
              {/* Display text if the sample site data loader has no items in it */}
              {!techniqueCount && (
                <Stack
                  sx={{
                    background: grey[50]
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
                  <Typography variant="body2">No Techniques</Typography>
                </Stack>
              )}

              <SamplingTechniqueCardContainer
                techniques={techniques}
                handleDelete={(technique) => {
                  console.log(technique);
                }}
              />
            </Box>
          </Stack>
        )}
      </Paper>
    </>
  );
};

export default SamplingSiteTechniqueContainer;
