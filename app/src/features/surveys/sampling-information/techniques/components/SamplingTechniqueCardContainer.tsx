import { mdiArrowTopRight, mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import blueGrey from '@mui/material/colors/blueGrey';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { GridRowSelectionModel } from '@mui/x-data-grid';
import { GridOverlay } from '@mui/x-data-grid/components/containers/GridOverlay';
import { GridColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { DeleteTechniqueI18N } from 'constants/i18n';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { IGetTechniqueResponse } from 'interfaces/useTechniqueApi.interface';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getCodesName } from 'utils/Utils';

interface ITechniqueRowData {
  id: number;
  method_lookup: string;
  name: string;
  description: string | null;
}

interface ISamplingTechniqueCardContainer {
  techniques: IGetTechniqueResponse[];
  bulkActionTechniques: GridRowSelectionModel;
  setBulkActionTechniques: (selection: GridRowSelectionModel) => void;
}

/**
 * Returns accordian cards for displaying technique technique details on the technique profile page
 *
 * @returns
 */
export const SamplingTechniqueCardContainer = <T extends ITechniqueRowData>(props: ISamplingTechniqueCardContainer) => {
  const { techniques, bulkActionTechniques, setBulkActionTechniques } = props;

  // Individual row action menu
  const [actionMenuTechnique, setActionMenuTechnique] = useState<number | null>(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();
  const codesContext = useCodesContext();
  const biohubApi = useBiohubApi();

  /**
   * Handle the delete technique API call.
   *
   */
  const handleDeleteTechnique = async () => {
    await biohubApi.technique
      .deleteTechnique(surveyContext.projectId, surveyContext.surveyId, Number(actionMenuTechnique))
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setActionMenuAnchorEl(null);
        surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setActionMenuAnchorEl(null);
        dialogContext.setSnackbar({
          snackbarMessage: (
            <>
              <Typography variant="body2" component="div">
                <strong>Error Deleting Technique</strong>
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
   * Display the delete technique dialog.
   *
   */
  const deleteTechniqueDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: DeleteTechniqueI18N.deleteTitle,
      dialogText: DeleteTechniqueI18N.deleteText,
      yesButtonLabel: DeleteTechniqueI18N.yesButtonLabel,
      noButtonLabel: DeleteTechniqueI18N.noButtonLabel,
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

  const rows: ITechniqueRowData[] =
    techniques.map((technique) => ({
      id: technique.method_technique_id,
      method_lookup:
        getCodesName(codesContext.codesDataLoader.data, 'sample_methods', technique.method_lookup_id) ?? '',
      name: technique.name,
      description: technique.description
    })) || [];

  const columns: GridColDef<T>[] = [
    { field: 'name', headerName: 'Name', flex: 0.4 },
    {
      field: 'method_lookup_id',
      flex: 0.4,
      headerName: 'Method',
      renderCell: (params) => (
        <Box>
          <ColouredRectangleChip label={params.row.method_lookup} colour={blueGrey} />
        </Box>
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      renderCell: (params) => {
        return (
          <Box alignItems="flex-start">
            <Typography
              color="textSecondary"
              variant="body2"
              flex="0.4"
              sx={{
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
              {params.row.description}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      flex: 1,
      align: 'right',
      renderCell: (params) => {
        return (
          <Box display="flex" position="fixed">
            <IconButton
              onClick={(event) => {
                setActionMenuTechnique(params.row.id);
                setActionMenuAnchorEl(event.currentTarget);
              }}>
              <Icon path={mdiDotsVertical} size={1} />
            </IconButton>
          </Box>
        );
      }
    }
  ];

  return (
    <>
      <Menu
        sx={{ pb: 2 }}
        open={Boolean(actionMenuAnchorEl)}
        onClose={() => setActionMenuAnchorEl(null)}
        anchorEl={actionMenuAnchorEl}
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
            to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling/techniques/${actionMenuTechnique}/edit`}>
            <ListItemIcon>
              <Icon path={mdiPencilOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Edit Details</ListItemText>
          </RouterLink>
        </MenuItem>
        <MenuItem
          onClick={() => {
            setActionMenuAnchorEl(null);
            deleteTechniqueDialog();
          }}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Box position="relative">
        <StyledDataGrid
          autoHeight
          getRowHeight={() => 'auto'}
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          disableColumnMenu
          checkboxSelection
          rowSelectionModel={bulkActionTechniques}
          onRowSelectionModelChange={setBulkActionTechniques}
          noRowsOverlay={
            <GridOverlay>
              <Box justifyContent="center" display="flex" flexDirection="column">
                <Typography mb={1} variant="h4" color="textSecondary" textAlign="center">
                  Start by adding sampling information&nbsp;
                  <Icon path={mdiArrowTopRight} size={1} />
                </Typography>
                <Typography color="textSecondary" textAlign="center">
                  Add techniques, then apply your techniques to sampling sites
                </Typography>
              </Box>
            </GridOverlay>
          }
          sx={{
            '& .MuiDataGrid-virtualScroller': {
              height: rows.length === 0 ? '250px' : 'unset',
              overflowY: 'auto !important',
              overflowX: 'hidden'
            },
            '& .MuiDataGrid-overlay': {
              height: '250px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            },
            '& .MuiDataGrid-columnHeaderDraggableContainer': {
              minWidth: '50px'
            },
            // '& .MuiDataGrid-cell--textLeft': { justifyContent: 'flex-end' }
            '& .MuiDataGrid-cell--textLeft:last-child': {
              // justifyContent: 'flex-end !important'
            }
          }}
        />
      </Box>
    </>
  );
};
