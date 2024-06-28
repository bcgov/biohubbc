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
import { GridOverlay } from '@mui/x-data-grid/components/containers/GridOverlay';
import { GridColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
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
}

/**
 * Returns accordian cards for displaying technique technique details on the technique profile page
 *
 * @returns
 */
export const SamplingTechniqueCardContainer = <T extends ITechniqueRowData>(props: ISamplingTechniqueCardContainer) => {
  const [selectedTechnique, setSelectedTechnique] = useState<number | null>(null);
  const [techniqueAnchorEl, setTechniqueAnchorEl] = useState<MenuProps['anchorEl']>(null);

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
      .deleteTechnique(surveyContext.projectId, surveyContext.surveyId, Number(selectedTechnique))
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setTechniqueAnchorEl(null);
        surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setTechniqueAnchorEl(null);
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

  const rows: ITechniqueRowData[] =
    props.techniques.map((technique) => ({
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
                setSelectedTechnique(params.row.id);
                setTechniqueAnchorEl(event.currentTarget);
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
      {selectedTechnique && (
        <Menu
          sx={{ pb: 2 }}
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
            <RouterLink
              to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling/techniques/${selectedTechnique}/edit`}>
              <ListItemIcon>
                <Icon path={mdiPencilOutline} size={1} />
              </ListItemIcon>
              <ListItemText>Edit Details</ListItemText>
            </RouterLink>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setTechniqueAnchorEl(null);
              deleteTechniqueDialog();
            }}>
            <ListItemIcon>
              <Icon path={mdiTrashCanOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      )}

      {/* {techniques.map((technique) => (
        <Box m={2} key={technique.method_technique_id}>
          <SamplingTechniqueCard
            technique={technique}
            method_lookup_name={
              getCodesName(codesContext.codesDataLoader.data, 'sample_methods', technique.method_lookup_id) ?? ''
            }
            handleMenuClick={(event) => {
              setTechniqueAnchorEl(event.currentTarget);
              setSelectedTechnique(technique.method_technique_id);
            }}
          />
        </Box>
      ))} */}

      <Box position="relative">
        <StyledDataGrid
          rowSelection={false}
          autoHeight
          getRowHeight={() => 'auto'}
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          disableColumnMenu
          checkboxSelection
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
