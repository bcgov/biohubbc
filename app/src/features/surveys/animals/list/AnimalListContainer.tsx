import { mdiArrowTopRight, mdiDotsVertical, mdiMagnify, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { ISurveyCritter } from 'contexts/animalPageContext';
import { CritterListItem } from 'features/surveys/animals/list/components/CritterListItem';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useAnimalPageContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();
  const { surveyId } = useSurveyContext();
  const { setSelectedAnimal, selectedAnimal } = useAnimalPageContext();

  const surveyCrittersDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCritters(surveyContext.surveyId));

  useEffect(() => {
    if (!selectedAnimal && surveyCrittersDataLoader.data) {
      const animal = surveyCrittersDataLoader.data[0];
      setSelectedAnimal(animal);
    }
  }, [setSelectedAnimal, selectedAnimal, surveyCrittersDataLoader.data]);

  useEffect(() => {
    surveyCrittersDataLoader.load();
  }, [surveyCrittersDataLoader]);

  const critters = surveyCrittersDataLoader.data ?? [];

  // Filter critters by animal_id using searchTerm (case-insensitive, partial match)
  const filteredCritters = critters.filter((critter) =>
    critter.animal_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckboxChange = (id: number) => {
    setCheckboxSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleToggleCritterSelect = (critter: ISurveyCritter) => {
    setSelectedAnimal(selectedAnimal?.critter_id === critter.critter_id ? undefined : critter);
  };

  const handleCritterMenuClick = (event: React.MouseEvent<HTMLButtonElement>, critter: ISurveyCritter) => {
    setCritterAnchorEl(event.currentTarget);
    setSelectedCritterMenu(critter);
  };

  const handleDeleteCritter = async (id: number) => {
    try {
      await biohubApi.survey.removeCrittersFromSurvey(surveyContext.surveyId, [id]);
      if (selectedAnimal?.critter_id === id) {
        setSelectedAnimal();
      }
      surveyContext.critterDataLoader.refresh(surveyContext.surveyId);
    } catch (error) {
      dialogContext.setSnackbar({
        snackbarMessage: (
          <>
            <Typography variant="body2" fontWeight="bold">
              Error Deleting Animal
            </Typography>
            <Typography variant="body2">{String(error)}</Typography>
          </>
        ),
        open: true
      });
    } finally {
      dialogContext.setYesNoDialog({ open: false });
      setCritterAnchorEl(null);
    }
  };

  const handleBulkDeleteCritters = async () => {
    try {
      await biohubApi.survey.removeCrittersFromSurvey(surveyContext.surveyId, checkboxSelectedIds);
      if (checkboxSelectedIds.includes(selectedAnimal?.critter_id!)) {
        setSelectedAnimal();
      }
      surveyContext.critterDataLoader.refresh(surveyContext.surveyId);
    } catch (error) {
      dialogContext.setSnackbar({
        snackbarMessage: (
          <>
            <Typography variant="body2" fontWeight="bold">
              Error Deleting Animals
            </Typography>
            <Typography variant="body2">{String(error)}</Typography>
          </>
        ),
        open: true
      });
    } finally {
      dialogContext.setYesNoDialog({ open: false });
      setCheckboxSelectedIds([]);
      setHeaderAnchorEl(null);
    }
  };

  const confirmDeleteDialog = (isBulk = false) => {
    dialogContext.setYesNoDialog({
      dialogTitle: isBulk ? 'Delete Animals?' : 'Delete Animal?',
      dialogContent: (
        <Typography variant="body1" color="textSecondary">
          Are you sure you want to delete {isBulk ? 'the selected Animals' : 'this Animal'}?
        </Typography>
      ),
      yesButtonLabel: isBulk ? 'Delete Animals' : 'Delete Animal',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'error' },
      onYes: () => {
        isBulk
          ? handleBulkDeleteCritters()
          : selectedCritterMenu?.critter_id && handleDeleteCritter(selectedCritterMenu.critter_id);
      },
      onNo: () => dialogContext.setYesNoDialog({ open: false }),
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      open: true
    });
  };

  const allSelected = checkboxSelectedIds.length === critters.length;
  const isIndeterminate = checkboxSelectedIds.length > 0 && !allSelected;

  return (
    <>
      {selectedCritterMenu && (
        <Menu
          open={!!critterAnchorEl}
          onClose={() => setCritterAnchorEl(null)}
          anchorEl={critterAnchorEl}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
          <MenuItem
            component={RouterLink}
            to={`/admin/surveys/${surveyId}/animals/${selectedCritterMenu.critter_id}/edit`}
            onClick={() => setSelectedAnimal(selectedCritterMenu)}>
            <ListItemIcon>
              <Icon path={mdiPencilOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Edit Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => confirmDeleteDialog()}>
            <ListItemIcon>
              <Icon path={mdiTrashCanOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      )}

      <Menu
        open={!!headerAnchorEl}
        onClose={() => setHeaderAnchorEl(null)}
        anchorEl={headerAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={() => confirmDeleteDialog(true)}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Stack sx={{ flex: 1 }} height="100%">
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} px={2}>
          <AnimalListToolbar animalCount={surveyCrittersDataLoader.data?.length ?? 0} />
        </Box>
        <LoadingGuard
          isLoading={surveyCrittersDataLoader.isLoading}
          isLoadingFallback={<SkeletonList />}
          hasNoData={!filteredCritters.length}
          hasNoDataFallback={
            <>
              <Divider />
              <NoDataOverlay
                title="Add Animals"
                subtitle="Animals added to your Survey will appear here"
                icon={mdiArrowTopRight}
              />
            </>
          }>
          <Box px={2} flex="1 1 auto">
            <TextField
              placeholder="Search by Animal ID"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Box mx={1} mt="6px" color={grey[500]}>
                    <Icon path={mdiMagnify} size={1} />
                  </Box>
                )
              }}
            />
            <Box
              flexDirection="row"
              mr={3.5}
              flex="1 1 auto"
              display="flex"
              alignItems="center"
              justifyContent="space-between">
              <FormControlLabel
                sx={{ pt: 2, pb: 1, px: 2, flex: '1 1 auto' }}
                control={
                  <Checkbox
                    checked={allSelected}
                    indeterminate={isIndeterminate}
                    onClick={() => setCheckboxSelectedIds(allSelected ? [] : critters.map((c) => c.critter_id))}
                  />
                }
                label={
                  <Typography variant="body2" color="textSecondary" fontWeight={700} pl={0.5}>
                    Select All
                  </Typography>
                }
              />
              <IconButton
                edge="end"
                aria-label="header-settings"
                disabled={!checkboxSelectedIds.length}
                onClick={(e) => setHeaderAnchorEl(e.currentTarget)}
                title="Bulk Actions">
                <Icon path={mdiDotsVertical} size={1} style={{ marginTop: '6px' }} />
              </IconButton>
            </Box>
            <List sx={{ '& .MuiListItem-root': { borderRadius: '4px', mb: 0.5 } }} color="primary">
              {filteredCritters.map((critter) => (
                <CritterListItem
                  key={critter.critter_id}
                  critter={critter}
                  isSelectedAnimal={selectedAnimal?.critter_id === critter.critter_id}
                  onAnimalClick={handleToggleCritterSelect}
                  isCheckboxSelected={checkboxSelectedIds.includes(critter.critter_id)}
                  onCheckboxClick={handleCheckboxChange}
                  onMenuClick={handleCritterMenuClick}
                />
              ))}
            </List>
          </Box>
        </LoadingGuard>
      </Stack>
    </>
  );
};
