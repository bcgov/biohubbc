import { mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
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
import Typography from '@mui/material/Typography';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { ISurveyCritter } from 'contexts/animalPageContext';
import { useAnimalPageContext, useCodesContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import CritterListItem from './components/CritterListItem';
import SurveyAnimalListToolbar from './components/SurveyAnimalListToolbar';

/**
 * Returns a list of all animals (critters) in the survey
 *
 * @returns
 *
 */
const SurveyAnimalList = () => {
  const [checkboxSelectedIds, setCheckboxSelectedIds] = useState<number[]>([]);
  const [critterAnchorEl, setCritterAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [headerAnchorEl, setHeaderAnchorEl] = useState<MenuProps['anchorEl']>(null);
  const [selectedCritterMenu, setSelectedMenuCritter] = useState<ISurveyCritter | null>(null);

  const codesContext = useCodesContext();
  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();

  const { projectId, surveyId } = useSurveyContext();

  const { setSelectedAnimal } = useAnimalPageContext();

  const critters = surveyContext.critterDataLoader.data;

  if (!critters) {
    return <CircularProgress size={40} />;
  }

  const crittersCount = critters.length;

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
    setSelectedMenuCritter(critter);
  };

  /**
   * Handle the deletion of a critter
   *
   */
  const handleDeleteCritter = async () => {
    // await biohubApi.critter
    //   .deleteCritter(surveyContext.projectId, surveyContext.surveyId, Number(selectedAnimal))
    //   .then(() => {
    //     dialogContext.setYesNoDialog({ open: false });
    //     setCritterAnchorEl(null);
    //     surveyContext.CritterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    //   })
    //   .catch((error: any) => {
    //     dialogContext.setYesNoDialog({ open: false });
    //     setCritterAnchorEl(null);
    //     dialogContext.setSnackbar({
    //       snackbarMessage: (
    //         <>
    //           <Typography variant="body2" component="div">
    //             <strong>Error Deleting Sampling Site</strong>
    //           </Typography>
    //           <Typography variant="body2" component="div">
    //             {String(error)}
    //           </Typography>
    //         </>
    //       ),
    //       open: true
    //     });
    //   });
    console.log('Cannot delete critters');
  };

  const handleBulkDeleteCritters = async () => {
    // await biohubApi.critters
    //   .deleteCritters(surveyContext.projectId, surveyContext.surveyId, checkboxSelectedIds)
    //   .then(() => {
    //     dialogContext.setYesNoDialog({ open: false });
    //     setCheckboxSelectedIds([]);
    //     setHeaderAnchorEl(null);
    //     surveyContext.CritterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    //   })
    //   .catch((error: any) => {
    //     dialogContext.setYesNoDialog({ open: false });
    //     setCheckboxSelectedIds([]);
    //     setHeaderAnchorEl(null);
    //     dialogContext.setSnackbar({
    //       snackbarMessage: (
    //         <>
    //           <Typography variant="body2" component="div">
    //             <strong>Error Deleting Sampling Sites</strong>
    //           </Typography>
    //           <Typography variant="body2" component="div">
    //             {String(error)}
    //           </Typography>
    //         </>
    //       ),
    //       open: true
    //     });
    //   });
    console.log('Cannot delete critters');
  };

  /**
   * Display the delete sampling site dialog.
   *
   */
  const deleteCritterDialog = () => {
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
        handleDeleteCritter();
      }
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
        handleBulkDeleteCritters();
      }
    });
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
              to={`/admin/projects/${projectId}/surveys/${surveyId}/animals/${selectedCritterMenu.survey_critter_id}/edit`}
              onClick={() => {
                setSelectedAnimal(selectedCritterMenu);
              }}>
              <ListItemIcon>
                <Icon path={mdiPencilOutline} size={1} />
              </ListItemIcon>
              <ListItemText>Edit Details</ListItemText>
            </RouterLink>
          </MenuItem>
          <MenuItem onClick={deleteCritterDialog}>
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
        <SurveyAnimalListToolbar animalCount={critters.length} checkboxSelectedIdsLength={checkboxSelectedIds.length} />
        <Divider flexItem />
        <Box position="relative" display="flex" flex="1 1 auto" overflow="hidden">
          <Box position="absolute" top="0" right="0" bottom="0" left="0" flex="1 1 auto">
            {surveyContext.critterDataLoader.isLoading || codesContext.codesDataLoader.isLoading ? (
              <SkeletonList />
            ) : (
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

                            const critterIds = critters.map((critter) => critter.survey_critter_id);
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
                  {!critters.length && (
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
                  )}
                  {critters.map((critter) => (
                    <Stack direction="row" display="flex" alignItems="center" overflow="hidden" flex="1 1 auto">
                      <CritterListItem
                        key={`${critter.survey_critter_id}-${critter.critter_id}`}
                        critter={critter}
                        isChecked={checkboxSelectedIds.includes(critter.survey_critter_id)}
                        handleCheckboxChange={handleCheckboxChange}
                      />
                      <IconButton
                        sx={{ position: 'absolute', right: '24px' }}
                        edge="end"
                        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                          handleCritterMenuClick(event, {
                            critterbase_critter_id: critter.critter_id,
                            survey_critter_id: critter.survey_critter_id
                          })
                        }
                        aria-label="animal-settings">
                        <Icon path={mdiDotsVertical} size={1} />
                      </IconButton>
                    </Stack>
                  ))}
                </Box>
              </Stack>
            )}
          </Box>
        </Box>
      </Paper>
    </>
  );
};

export default SurveyAnimalList;
