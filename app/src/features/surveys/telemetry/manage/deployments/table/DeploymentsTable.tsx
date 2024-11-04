import { mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { colors } from '@mui/material';
import Box from '@mui/material/Box';
import green from '@mui/material/colors/green';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { TelemetryDeployment } from 'interfaces/useTelemetryDeploymentApi.interface';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { combineDateTime } from 'utils/datetime';

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
  /**
   * Callback fired when a deployment is deleted.
   */
  onDelete?: () => void;
}

/**
 * Returns a table of telemetry deployments.
 *
 * @param {IDeploymentsTableProps} props
 * @return {*}
 */
export const DeploymentsTable = (props: IDeploymentsTableProps) => {
  const { deployments, selectedRows, setSelectedRows, onDelete } = props;

  const biohubApi = useBiohubApi();

  const codesContext = useCodesContext();
  const dialogContext = useDialogContext();
  const surveyContext = useSurveyContext();

  const [actionMenuDeploymentId, setActionMenuDeploymentId] = useState<number | undefined>();
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<MenuProps['anchorEl']>(null);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
  };

  const handleDeleteDeployment = async () => {
    if (!actionMenuDeploymentId) {
      return;
    }

    await biohubApi.telemetryDeployment
      .deleteDeployment(surveyContext.projectId, surveyContext.surveyId, actionMenuDeploymentId)
      .then(() => {
        dialogContext.setYesNoDialog({ open: false });
        setActionMenuAnchorEl(null);
        onDelete?.();
      })
      .catch((error: any) => {
        dialogContext.setYesNoDialog({ open: false });
        setActionMenuAnchorEl(null);
        dialogContext.setSnackbar({
          snackbarMessage: (
            <>
              <Typography variant="body2" component="div">
                <strong>Error Deleting Deployment</strong>
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
   * Display the delete deployment dialog.
   */
  const deleteDeploymentDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete deployment?',
      dialogText: 'Are you sure you want to permanently delete this deployment?',
      yesButtonLabel: 'Delete Deployment',
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
        handleDeleteDeployment();
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
      field: 'device_id',
      headerName: 'Device ID',
      width: 100,
      minWidth: 100,
      renderHeader: () => (
        <Typography color={grey[500]} variant="body2" fontWeight={700}>
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.device_id}
        </Typography>
      )
    },
    {
      field: 'critter_id',
      headerName: 'Animal',
      flex: 1,
      renderCell: (params) => (
        <>
          {
            surveyContext.critterDataLoader.data?.find((critter) => critter.critter_id === params.row.critter_id)
              ?.animal_id
          }
        </>
      )
    },
    {
      field: 'critter_id',
      headerName: 'Animal',
      flex: 1,
      renderCell: (params) => <>{params.row.device_id}</>
    },
    {
      field: 'frequency',
      headerName: 'Frequency',
      flex: 1,
      renderCell: (params) => (
        <Typography>
          {params.row.frequency}&nbsp;
          <Typography component="span" sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {codesContext.codesDataLoader.data?.frequency_units.find(
              (frequencyUnit) => frequencyUnit.id === params.row.frequency_unit_id
            )?.name ?? null}
          </Typography>
        </Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => {
        if (!params.row.attachment_end_date) {
          return null;
        }

        const endDate = combineDateTime(params.row.attachment_end_date, params.row.attachment_end_time);

        // If end date is before the current date, the status is inactive
        if (dayjs().isBefore(endDate)) {
          return <ColouredRectangleChip colour={colors.blue} label="Done" />;
        }

        return <ColouredRectangleChip colour={green} label="active" />;
      }
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
            deleteDeploymentDialog();
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
