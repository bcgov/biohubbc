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
import { GridColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { DeleteTechniqueI18N } from 'constants/i18n';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { IGetTechniqueResponse, TechniqueAttractant } from 'interfaces/useTechniqueApi.interface';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getCodesName } from 'utils/Utils';

export interface ITechniqueRowData {
  id: number;
  method_lookup_id: number;
  name: string;
  description: string | null;
  attractants: TechniqueAttractant[];
  distance_threshold: number | null;
}

interface ISamplingTechniqueTable {
  techniques: IGetTechniqueResponse[];
  bulkActionTechniques: GridRowSelectionModel;
  setBulkActionTechniques: (selection: GridRowSelectionModel) => void;
}

/**
 * Returns accordian cards for displaying technique technique details on the technique profile page
 *
 * @returns
 */
export const SamplingTechniqueTable = <T extends ITechniqueRowData>(props: ISamplingTechniqueTable) => {
  const { techniques, bulkActionTechniques, setBulkActionTechniques } = props;

  // Individual row action menu
  const [actionMenuTechnique, setActionMenuTechnique] = useState<number | null>(null);
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const surveyContext = useSurveyContext();
  const dialogContext = useDialogContext();
  const codesContext = useCodesContext();
  const biohubApi = useBiohubApi();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

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
      method_lookup_id: technique.method_lookup_id,
      name: technique.name,
      description: technique.description,
      attractants: technique.attractants,
      distance_threshold: technique.distance_threshold
    })) || [];

  const columns: GridColDef<T>[] = [
    { field: 'name', headerName: 'Name', flex: 0.4 },
    {
      field: 'method_lookup_id',
      flex: 0.4,
      headerName: 'Method',
      renderCell: (params) => (
        <ColouredRectangleChip
          label={getCodesName(codesContext.codesDataLoader.data, 'sample_methods', params.row.method_lookup_id) ?? ''}
          colour={blueGrey}
        />
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
      field: 'attractants',
      flex: 0.5,
      headerName: 'Attractants',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {params.row.attractants.map((attractant) => (
            <Box key={attractant.attractant_lookup_id} mr={1} mb={1}>
              <ColouredRectangleChip
                label={
                  getCodesName(codesContext.codesDataLoader.data, 'attractants', attractant.attractant_lookup_id) ?? ''
                }
                colour={blueGrey}
              />
            </Box>
          ))}
        </Box>
      )
    },
    {
      field: 'distance_threshold',
      headerName: 'Distance threshold',
      flex: 0.3,
      renderCell: (params) => (params.row.distance_threshold ? <>{params.row.distance_threshold}&nbsp;m</> : <></>)
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      flex: 0.3,
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

      <LoadingGuard
        hasNoData={!rows.length}
        hasNoDataFallback={
          <NoDataOverlay
            height="200px"
            title="Add Techniques"
            subtitle="Techniques describe how you collected species observations"
            icon={mdiArrowTopRight}
          />
        }
        hasNoDataFallbackDelay={100}>
        <StyledDataGrid
          rows={rows}
          columns={columns}
          autoHeight
          getRowHeight={() => 'auto'}
          disableRowSelectionOnClick
          disableColumnMenu
          checkboxSelection
          rowSelectionModel={bulkActionTechniques}
          onRowSelectionModelChange={setBulkActionTechniques}
          initialState={{
            pagination: {
              paginationModel: { page: 1, pageSize: 10 }
            }
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      </LoadingGuard>
    </>
  );
};
