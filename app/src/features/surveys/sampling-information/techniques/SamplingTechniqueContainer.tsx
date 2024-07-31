import { mdiDotsVertical, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { DeleteTechniquesBulkI18N } from 'constants/i18n';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SamplingTechniqueTable } from './components/SamplingTechniqueTable';

/**
 * Renders a list of techniques.
 *
 * @return {*}
 */
export const SamplingTechniqueContainer = () => {
  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();

  const biohubApi = useBiohubApi();

  // Multi-select row action menu
  const [bulkActionTechniques, setBulkActionTechniques] = useState<GridRowSelectionModel>([]);
  const [bulkActionMenuAnchorEl, setBulkActionMenuAnchorEl] = useState<MenuProps['anchorEl']>(null);

  useEffect(() => {
    surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyContext.projectId, surveyContext.surveyId]);

  const techniqueCount = surveyContext.techniqueDataLoader.data?.count ?? 0;
  const techniques = surveyContext.techniqueDataLoader.data?.techniques ?? [];

  const handleBulkDeleteTechniques = async () => {
    await biohubApi.technique
      .deleteTechniques(surveyContext.projectId, surveyContext.surveyId, bulkActionTechniques.map(Number))
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setBulkActionTechniques([]);
        setBulkActionMenuAnchorEl(null);
        surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setBulkActionTechniques([]);
        setBulkActionMenuAnchorEl(null);
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

  const deleteBulkTechniquesDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: DeleteTechniquesBulkI18N.deleteTitle,
      dialogText: DeleteTechniquesBulkI18N.deleteText,
      yesButtonLabel: DeleteTechniquesBulkI18N.yesButtonLabel,
      noButtonLabel: DeleteTechniquesBulkI18N.noButtonLabel,
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
    <Stack
      flexDirection="column"
      height="100%"
      sx={{
        overflow: 'hidden'
      }}>
      <Menu
        open={Boolean(bulkActionMenuAnchorEl)}
        onClose={() => setBulkActionMenuAnchorEl(null)}
        anchorEl={bulkActionMenuAnchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}>
        <MenuItem onClick={deleteBulkTechniquesDialog}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Toolbar
        disableGutters
        sx={{
          flex: '0 0 auto',
          pr: 3,
          pl: 3
        }}>
        <Typography variant="h3" component="h2" flexGrow={1}>
          Techniques &zwnj;
          <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({techniqueCount})
          </Typography>
        </Typography>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to={'sampling/techniques/create'}
          startIcon={<Icon path={mdiPlus} size={0.8} />}>
          Add
        </Button>
        <IconButton
          edge="end"
          sx={{
            ml: 1
          }}
          aria-label="header-settings"
          disabled={!bulkActionTechniques.length}
          onClick={(event) => setBulkActionMenuAnchorEl(event.currentTarget)}
          title="Bulk Actions">
          <Icon path={mdiDotsVertical} size={1} />
        </IconButton>
      </Toolbar>

      <Divider flexItem></Divider>

      <LoadingGuard
        isLoading={surveyContext.techniqueDataLoader.isLoading || !surveyContext.techniqueDataLoader.isReady}
        fallback={<SkeletonTable />}
        delay={200}>
        <Box p={2}>
          <SamplingTechniqueTable
            techniques={techniques}
            bulkActionTechniques={bulkActionTechniques}
            setBulkActionTechniques={setBulkActionTechniques}
          />
        </Box>
      </LoadingGuard>
    </Stack>
  );
};
