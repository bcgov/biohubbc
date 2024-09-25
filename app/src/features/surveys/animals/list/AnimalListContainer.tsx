import { mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { ISurveyCritter } from 'contexts/animalPageContext';
import { CritterListItem } from 'features/surveys/animals/list/components/CritterListItem';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useAnimalPageContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AnimalListToolbar } from './components/AnimalListToolbar';

/**
 * Returns a list of all animals (critters) in the survey
 *
 * @return {*}
 */
export const AnimalListContainer = () => {
  const [checkboxSelectedIds, setCheckboxSelectedIds] = useState<number[]>([]);
  const [critterAnchorEl, setCritterAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [headerAnchorEl, setHeaderAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [selectedCritterMenu, setSelectedCritterMenu] = useState<ISurveyCritter>();

  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();

  const biohubApi = useBiohubApi();

  const { projectId, surveyId } = useSurveyContext();

  const { setSelectedAnimal, selectedAnimal } = useAnimalPageContext();

  const critters = surveyContext.critterDataLoader.data;

  const crittersCount = critters?.length ?? 0;

  const handleCheckboxChange = (critterId: number) => {
    setCheckboxSelectedIds((prev) => {
      if (prev.includes(critterId)) {
        return prev.filter((item) => item !== critterId);
      } else {
        return [...prev, critterId];
      }
    });
  };

  const handleCritterMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, critter: ISurveyCritter) => {
    setCritterAnchorEl(event.currentTarget);
    setSelectedCritterMenu(critter);
  };

  /**
   * Handle the deletion of a critter
   *
   */
  const handleDeleteCritter = async (surveyCritterId: number) => {
    await biohubApi.survey
      .removeCrittersFromSurvey(surveyContext.projectId, surveyContext.surveyId, [surveyCritterId])
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setCritterAnchorEl(null);
        surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setCritterAnchorEl(null);
        dialogContext.setSnackbar({
          snackbarMessage: (
            <>
              <Typography variant="body2" component="div">
                <strong>Error Deleting Animal</strong>
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
   * Handle the deletion of multiple critters
   *
   */
  const handleBulkDeleteCritters = async () => {
    await biohubApi.survey
      .removeCrittersFromSurvey(surveyContext.projectId, surveyContext.surveyId, checkboxSelectedIds)
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });

        // If the selected animal is the deleted animal, unset the selected animal
        if (checkboxSelectedIds.some((id) => id == selectedAnimal?.critter_id)) {
          setSelectedAnimal();
        }

        setCheckboxSelectedIds([]);
        setHeaderAnchorEl(null);
        surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setCheckboxSelectedIds([]);
        setHeaderAnchorEl(null);
        dialogContext.setSnackbar({
          snackbarMessage: (
            <>
              <Typography variant="body2" component="div">
                <strong>Error Deleting Animals</strong>
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
   * Display the delete Animal dialog.
   *
   */
  const deleteCritterDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Animal?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Are you sure you want to delete this Animal?
        </Typography>
      ),
      yesButtonLabel: 'Delete Animal',
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
        if (selectedCritterMenu?.critter_id) {
          handleDeleteCritter(selectedCritterMenu?.critter_id);
        }
        // If the selected animal is the deleted animal, unset the selected animal
        if (selectedCritterMenu?.critter_id == selectedAnimal?.critter_id) {
          setSelectedAnimal();
        }
      }
    });
  };

  const handlePromptConfirmBulkDelete = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete Animals?',
      dialogContent: (
        <Typography variant="body1" component="div" color="textSecondary">
          Are you sure you want to delete the selected Animals?
        </Typography>
      ),
      yesButtonLabel: 'Delete Animals',
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
        handleBulkDeleteCritters();
      }
    });
  };

  const handleHeaderMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setHeaderAnchorEl(event.currentTarget);
  };

  return (
    <>
      {selectedCritterMenu && (
        <Menu
          open={Boolean(critterAnchorEl)}
          onClose={() => setCritterAnchorEl(null)}
          anchorEl={critterAnchorEl}
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
            <RouterLink
              to={`/admin/projects/${projectId}/surveys/${surveyId}/animals/${selectedCritterMenu.critter_id}/edit`}
              onClick={() => {
                setSelectedAnimal(selectedCritterMenu);
              }}>
              <ListItemIcon>
                <Icon path={mdiPencilOutline} size={1} />
              </ListItemIcon>
              <ListItemText>Edit Details</ListItemText>
            </RouterLink>
          </MenuItem>
          <MenuItem
            onClick={() => {
              deleteCritterDialog();
              setCritterAnchorEl(null);
            }}>
            <ListItemIcon>
              <Icon path={mdiTrashCanOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      )}

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
        flex="1 1 auto"
        sx={{
          overflow: 'hidden'
        }}>
        <AnimalListToolbar
          handleHeaderMenuClick={handleHeaderMenuClick}
          animalCount={crittersCount}
          checkboxSelectedIdsLength={checkboxSelectedIds.length}
        />
        <Divider flexItem />
        <Box position="relative" display="flex" flex="1 1 auto" overflow="hidden">
          <Box position="absolute" top="0" right="0" bottom="0" left="0" flex="1 1 auto">
            <LoadingGuard
              isLoading={surveyContext.critterDataLoader.isLoading}
              isLoadingFallback={<SkeletonList />}
              isLoadingFallbackDelay={100}
              hasNoData={!critters?.length}
              hasNoDataFallback={
                <Stack
                  sx={{
                    background: grey[100]
                  }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flex="1 1 auto"
                  overflow="hidden"
                  position="absolute"
                  top={0}
                  right={0}
                  left={0}
                  bottom={0}
                  height="100%">
                  <Typography variant="body2">No Animals</Typography>
                </Stack>
              }
              hasNoDataFallbackDelay={100}>
              <Stack height="100%" position="relative" sx={{ overflowY: 'auto', flex: '1 1 auto' }}>
                <Box display="flex" alignItems="center" px={2} height={55} width="100%">
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
                          checked={checkboxSelectedIds.length > 0 && checkboxSelectedIds.length === crittersCount}
                          indeterminate={checkboxSelectedIds.length >= 1 && checkboxSelectedIds.length < crittersCount}
                          onClick={() => {
                            if (checkboxSelectedIds.length === crittersCount) {
                              setCheckboxSelectedIds([]);
                              return;
                            }

                            const critterIds = critters?.map((critter) => critter.critter_id) ?? [];

                            setCheckboxSelectedIds(critterIds);
                          }}
                          inputProps={{ 'aria-label': 'controlled' }}
                        />
                      }
                    />
                  </FormGroup>
                </Box>
                <Divider flexItem></Divider>
                <Box flex="1 1 auto">
                  <List>
                    {critters?.map((critter) => (
                      <CritterListItem
                        critter={critter}
                        isSelectedAnimal={selectedAnimal?.critter_id === critter.critter_id}
                        onAnimalClick={setSelectedAnimal}
                        isCheckboxSelected={checkboxSelectedIds.includes(critter.critter_id)}
                        onCheckboxClick={handleCheckboxChange}
                        onMenuClick={handleCritterMenuClick}
                      />
                    ))}
                  </List>
                </Box>
              </Stack>
            </LoadingGuard>
          </Box>
        </Box>
      </Paper>
    </>
  );
};
