import { mdiCogOutline, mdiPencil, mdiPlus, mdiTrashCan } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useHabitatFeatureTableContext, useSurveyContext } from 'hooks/useContext';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useState } from 'react';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { ImportHabitatFeaturesButton } from '../../import/ImportHabitatFeaturesButton';
import { SurveyHabitatFeatureTable } from './SurveyHabitatFeatureTable';

/**
 * Container for the Survey Habitat Feature Table.
 *
 * @return {*} {JSX.Element}
 */
export const SurveyHabitatFeatureTableContainer = (): JSX.Element => {
  const history = useHistory();
  const biohubApi = useBiohubApi();
  const dialogContext = useDialogContext();
  const habitatFeatureTableContext = useHabitatFeatureTableContext();
  const surveyContext = useSurveyContext();

  const [columnVisibilityMenuAnchorEl, setColumnVisibilityMenuAnchorEl] = useState<Element | null>(null);

  const handleCloseColumnVisibilityMenu = () => {
    setColumnVisibilityMenuAnchorEl(null);
  };

  /**
   * Delete habitat features.
   *
   * @param {number[]} habitatFeatureIds
   * @returns {*} {Promise<void>}
   */
  const deleteHabitatFeatures = (habitatFeatureIds: number[]): void => {
    dialogContext.setYesNoDialog({
      open: true,
      dialogTitle: 'Delete habitat features?',
      dialogText: 'This action will permanently delete the selected habitat features.',
      onYes: async () => {
        dialogContext.setYesNoDialog({ open: false });

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
            dialogTitle: 'Error deleting habitat features',
            dialogText: 'An error occurred while deleting the habitat features.',
            dialogError: error instanceof Error ? error.message : undefined,
            dialogErrorDetails: error instanceof APIError ? error.errors : undefined,
            onClose: () => {
              dialogContext.setErrorDialog({ open: false });
            },
            onOk: () => {
              dialogContext.setErrorDialog({ open: false });
            }
          });
        }
      },
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  return (
    <>
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
            <ImportHabitatFeaturesButton />
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
                onClick={() =>
                  deleteHabitatFeatures(habitatFeatureTableContext.rowSelectionModel.map((id) => Number(id)))
                }
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
              id="survey-habitat-features-table-actions-menu"
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
    </>
  );
};
