import { mdiCogOutline, mdiPencil, mdiPlus, mdiTrashCan } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, Collapse, Divider, IconButton, Paper, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useHabitatFeatureTableContext, useSurveyContext } from 'hooks/useContext';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useContext, useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { SurveyHabitatFeatureTable } from './SurveyHabitatFeatureTable';

/**
 * Container for the Survey Habitat Feature Table.
 *
 * @return {*} {JSX.Element}
 */
export const SurveyHabitatFeatureTableContainer = (): JSX.Element => {
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const dialogContext = useContext(DialogContext);
  const habitatFeatureTableContext = useHabitatFeatureTableContext();
  const surveyContext = useSurveyContext();

  const [columnVisibilityMenuAnchorEl, setColumnVisibilityMenuAnchorEl] = useState<Element | null>(null);
  const [openDeleteHabitatFeatureDialog, setOpenDeleteHabitatFeatureDialog] = useState(false);

  const handleCloseColumnVisibilityMenu = () => {
    setColumnVisibilityMenuAnchorEl(null);
  };

  /**
   * Delete multiple habitat features.
   *
   * @param {number[]} habitatFeatureIds
   * @return {*} {Promise<void>}
   */
  const deleteHabitatFeatures = async (habitatFeatureIds: number[]) => {
    try {
      await biohubApi.habitatFeature.deleteSurveyHabitatFeatures(
        surveyContext.projectId,
        surveyContext.surveyId,
        habitatFeatureIds
      );

      habitatFeatureTableContext.refreshData();
    } catch (error) {
      dialogContext.setErrorDialog({
        open: true,
        dialogTitle: 'Error Deleting Habitat Features',
        dialogText: 'An error occurred while deleting the habitat features.',
        dialogError: error instanceof Error ? error.message : undefined,
        dialogErrorDetails: error instanceof APIError ? error.errors : undefined
      });
    } finally {
      setOpenDeleteHabitatFeatureDialog(false);
    }
  };

  dialogContext.setYesNoDialog({
    open: openDeleteHabitatFeatureDialog,
    dialogTitle: 'Are you sure you want to delete these habitat features?',
    onYes: async () => {
      await deleteHabitatFeatures(habitatFeatureTableContext.rowSelectionModel.map((id) => Number(id)));
    },
    onClose: () => {
      setOpenDeleteHabitatFeatureDialog(false);
    },
    onNo: () => {
      setOpenDeleteHabitatFeatureDialog(false);
    }
  });

  return (
    <Paper component={Stack} flexDirection="column" flex="1 1 auto" height="100%">
      <Toolbar
        disableGutters
        sx={{
          pl: 2,
          pr: 3
        }}>
        <Typography
          sx={{
            flexGrow: '1',
            fontSize: '1.125rem',
            fontWeight: 700
          }}>
          Habitat Features &zwnj;
          <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({habitatFeatureTableContext.rowCount})
          </Typography>
        </Typography>

        <Stack flexDirection="row" alignItems="center" gap={1} whiteSpace="nowrap">
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.HABITAT_FEATURES} />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiPlus} size={1} />}
            component={RouterLink}
            to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/habitat-features/create`}>
            Add
          </Button>

          <Collapse in={habitatFeatureTableContext.rowSelectionModel.length === 1} orientation="horizontal">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Icon path={mdiPencil} size={1} />}
              onClick={() => {
                history.push(`${habitatFeatureTableContext.rowSelectionModel[0]}/edit`);
              }}>
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Icon path={mdiTrashCan} size={1} />}
              onClick={() => setOpenDeleteHabitatFeatureDialog(true)}
              sx={{ ml: 1 }}>
              Delete
            </Button>
          </Collapse>

          <Tooltip title="Toggle column visibility">
            <IconButton onClick={(event) => setColumnVisibilityMenuAnchorEl(event.currentTarget)}>
              <Icon path={mdiCogOutline} size={1} />
            </IconButton>
          </Tooltip>

          <Menu
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            id="survey-observations-table-actions-menu"
            anchorEl={columnVisibilityMenuAnchorEl}
            open={Boolean(columnVisibilityMenuAnchorEl)}
            onClose={handleCloseColumnVisibilityMenu}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}>
            <Box
              sx={{
                xs: { maxHeight: '300px' },
                lg: { maxHeight: '400px' }
              }}>
              {habitatFeatureTableContext.columns.map((column) => {
                return (
                  <MenuItem
                    dense
                    key={column.field}
                    onClick={() => habitatFeatureTableContext.toggleColumnVisibility(column.field)}>
                    <Checkbox checked={!habitatFeatureTableContext.hiddenColumns.includes(column.field)} />
                    <ListItemText>{column.headerName}</ListItemText>
                  </MenuItem>
                );
              })}
            </Box>
          </Menu>
        </Stack>
      </Toolbar>

      <Divider flexItem></Divider>

      <Box display="flex" flexDirection="column" flex="1 1 auto" position="relative">
        <Box position="absolute" width="100%" height="100%">
          <SurveyHabitatFeatureTable />
        </Box>
      </Box>
    </Paper>
  );
};
