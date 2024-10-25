import { mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { TelemetryDeployment } from 'interfaces/useTelemetryDeploymentApi.interface';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export interface IDeploymentRowData {
  id: number;
  deployment2_id: number;
  critter_id: number;
  device_id: number;
  frequency: number | null;
  frequency_unit_id: number | null;
  attachment_start_date: string;
  attachment_start_time: string | null;
  attachment_end_date: string | null;
  attachment_end_time: string | null;
  critterbase_start_capture_id: string;
  critterbase_end_capture_id: string | null;
  critterbase_end_mortality_id: string | null;
}

interface IDeploymentsTableProps {
  deployments: TelemetryDeployment[];
  selectedRows: GridRowSelectionModel;
  setSelectedRows: (selection: GridRowSelectionModel) => void;
}

/**
 * Returns a table of telemetry deployments.
 *
 * @param {IDeploymentsTableProps} props
 * @return {*}
 */
export const DeploymentsTable = (props: IDeploymentsTableProps) => {
  const { deployments, selectedRows, setSelectedRows } = props;

  const codesContext = useCodesContext();
  const dialogContext = useDialogContext();
  const surveyContext = useSurveyContext();

  const biohubApi = useBiohubApi();
  const [actionMenuDeploymentId, setActionMenuDeploymentId] = useState<number | undefined>();
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
  };

  const handleDeleteSamplingSite = async () => {
    if (!actionMenuDeploymentId) {
      return;
    }

    await biohubApi.samplingSite
      .deleteSampleSite(surveyContext.projectId, surveyContext.surveyId, actionMenuDeploymentId)
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setActionMenuAnchorEl(null);
        surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setActionMenuAnchorEl(null);
        dialogContext.setSnackbar({
          snackbarMessage: (
            <>
              <Typography variant="body2" component="div">
                <strong>Error Deleting SamplingSite</strong>
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
   * Display the delete samplingSite dialog.
   *
   */
  const deleteSamplingSiteDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete sampling site?',
      dialogText: 'Are you sure you want to permanently delete this sampling site?',
      yesButtonLabel: 'Delete Site',
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
        handleDeleteSamplingSite();
      }
    });
  };

  const rows: IDeploymentRowData[] = deployments.map((deployment) => ({
    id: deployment.deployment2_id,
    deployment2_id: deployment.deployment2_id,
    critter_id: deployment.critter_id,
    device_id: deployment.device_id,
    frequency: deployment.frequency,
    frequency_unit_id: deployment.frequency_unit_id,
    attachment_start_date: deployment.attachment_start_date,
    attachment_start_time: deployment.attachment_start_time,
    attachment_end_date: deployment.attachment_end_date,
    attachment_end_time: deployment.attachment_end_time,
    critterbase_start_capture_id: deployment.critterbase_start_capture_id,
    critterbase_end_capture_id: deployment.critterbase_end_capture_id,
    critterbase_end_mortality_id: deployment.critterbase_end_mortality_id
  }));

  const columns: GridColDef<IDeploymentRowData>[] = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 1
    },
    {
      field: 'serial',
      headerName: 'Serial',
      flex: 1
    },
    {
      field: 'frequency',
      headerName: 'Frequency',
      flex: 1
    },
    {
      field: 'frequency_unit_id',
      headerName: 'Frequency Unit',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {codesContext.codesDataLoader.data?.frequency_unit.find(
            (frequencyUnit) => frequencyUnit.id === params.row.frequency_unit_id
          )?.name ?? null}
        </Box>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      width: 10,
      align: 'right',
      renderCell: (params) => {
        return (
          <Box position="fixed">
            <IconButton
              onClick={(event) => {
                setActionMenuDeploymentId(params.row.deployment2_id);
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
      {/* ROW ACTION MENU */}
      <Menu
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleCloseActionMenu}
        anchorEl={actionMenuAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
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
            to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/telemetry/manage/deployment/${actionMenuDeploymentId}/edit`}>
            <ListItemIcon>
              <Icon path={mdiPencilOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Edit Details</ListItemText>
          </RouterLink>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseActionMenu();
            deleteSamplingSiteDialog();
          }}>
          <ListItemIcon>
            <Icon path={mdiTrashCanOutline} size={1} />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* DATA TABLE */}
      <StyledDataGrid
        autoHeight
        getRowHeight={() => 'auto'}
        disableColumnMenu
        rows={rows}
        getRowId={(row: IDeploymentRowData) => row.id}
        columns={columns}
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={setSelectedRows}
        checkboxSelection
        initialState={{
          pagination: {
            paginationModel: { page: 1, pageSize: 10 }
          }
        }}
        pageSizeOptions={[10, 25, 50]}
      />
    </>
  );
};
