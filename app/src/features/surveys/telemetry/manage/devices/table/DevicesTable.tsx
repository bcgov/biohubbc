import { mdiCog, mdiDotsVertical, mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  MenuProps,
  Tooltip,
  Typography
} from '@mui/material';
import grey from '@mui/material/colors/grey';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { FOREIGN_KEY_CONSTRAINT_ERROR } from 'constants/errors';
import dayjs from 'dayjs';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { TelemetryDeployment } from 'interfaces/useTelemetryDeploymentApi.interface';
import { TelemetryDevice } from 'interfaces/useTelemetryDeviceApi.interface';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { combineDateTime } from 'utils/datetime';

export interface IDeviceRowData {
  id: number;
  device_id: number;
  serial: string;
  device_make_id: number;
  model: string | null;
  comment: string | null;
  status: string;
}

interface IDevicesTableProps {
  devices: TelemetryDevice[];
  deployments: TelemetryDeployment[];
  selectedRows: GridRowSelectionModel;
  setSelectedRows: (selection: GridRowSelectionModel) => void;
  onDelete?: () => void;
}

/**
 * Displays table of telemetry devices in the survey
 * @param {IDevicesTableProps} props
 * @returns {*}
 */
export const DevicesTable = (props: IDevicesTableProps) => {
  const { devices, deployments, selectedRows, onDelete } = props;
  const biohubApi = useBiohubApi();
  const codesContext = useCodesContext();
  const dialogContext = useDialogContext();
  const surveyContext = useSurveyContext();

  const [actionMenuDeviceId, setActionMenuDeviceId] = useState<number>();
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<MenuProps['anchorEl']>(null);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const handleDeleteDevice = async () => {
    if (!actionMenuDeviceId) {
      return;
    }

    try {
      await biohubApi.telemetryDevice.deleteDevice(surveyContext.surveyId, actionMenuDeviceId);
      dialogContext.setYesNoDialog({ open: false });
      setActionMenuAnchorEl(null);
      onDelete?.();
    } catch (error: any) {
      dialogContext.setYesNoDialog({ open: false });
      setActionMenuAnchorEl(null);
      dialogContext.setSnackbar({
        open: true,
        snackbarMessage: (
          <>
            <Typography variant="body2" component="div">
              <strong>Error Deleting Device</strong>
            </Typography>
            <Typography variant="body2" component="div">
              {String(error).includes(FOREIGN_KEY_CONSTRAINT_ERROR)
                ? 'You must delete the deployments involving this device before deleting the device.'
                : String(error)}
            </Typography>
          </>
        )
      });
    }
  };

  const confirmDeleteDeviceDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete device?',
      dialogText: 'Are you sure you want to permanently delete this device?',
      yesButtonLabel: 'Delete Device',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'error' },
      onYes: handleDeleteDevice,
      onNo: () => dialogContext.setYesNoDialog({ open: false }),
      onClose: () => dialogContext.setYesNoDialog({ open: false }),
      open: true
    });
  };

  const handleCloseMenu = () => {
    setActionMenuAnchorEl(null);
    confirmDeleteDeviceDialog();
  };

  const rows: IDeviceRowData[] = devices.map((device) => {
    const deviceDeployments = getDeviceDeploymentsForSerial(deployments, device.serial);
    const deployed = deviceDeployments.some(isDeploymentActive);

    return {
      id: device.device_id,
      device_id: device.device_id,
      serial: device.serial,
      device_make_id: device.device_make_id,
      model: device.model,
      comment: device.comment,
      status: deployed ? 'deployed' : 'available'
    };
  });

  const columns: GridColDef<IDeviceRowData>[] = [
    {
      field: 'device_id',
      headerName: 'Device ID',
      width: 85,
      renderHeader: (params) => (
        <Tooltip title={params.colDef.description}>
          <Typography color={grey[500]} variant="body2">
            ID
          </Typography>
        </Tooltip>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.device_id}
        </Typography>
      )
    },
    {
      field: 'serial',
      headerName: 'Serial Number',
      flex: 1
    },
    {
      field: 'device_make_id',
      headerName: 'Make',
      flex: 1,
      renderCell: (params) => {
        const device_make = codesContext.codesDataLoader.data?.telemetry_device_makes.find(
          (device_make) => device_make.id === params.row.device_make_id
        )?.name;
        return device_make ?? null;
      }
    },
    {
      field: 'model',
      headerName: 'Model',
      flex: 1
    },
    {
      field: 'comment',
      headerName: 'Comment',
      flex: 1
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      width: 10,
      align: 'right',
      renderCell: (params) => (
        <Box position="fixed">
          <IconButton
            onClick={(e) => {
              setActionMenuDeviceId(params.row.device_id);
              setActionMenuAnchorEl(e.currentTarget);
            }}>
            <Icon path={mdiDotsVertical} size={1} />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <>
      <Menu
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleCloseMenu}
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
            to={`/admin/surveys/${surveyContext.surveyId}/telemetry/manage/device/${actionMenuDeviceId}/edit`}>
            <ListItemIcon>
              <Icon path={mdiPencilOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Edit Details</ListItemText>
          </RouterLink>
        </MenuItem>
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
          <RouterLink to={`/admin/surveys/${surveyContext.surveyId}/telemetry/manage/`}>
            <ListItemIcon>
              <Icon path={mdiCog} size={1} />
            </ListItemIcon>
            <ListItemText>Manage</ListItemText>
          </RouterLink>
        </MenuItem>
      </Menu>

      <StyledDataGrid
        rowHeight={52}
        disableColumnMenu
        rows={rows}
        getRowId={(row) => row.id}
        columns={columns}
        rowSelectionModel={selectedRows}
        initialState={{
          pagination: { paginationModel: { page: 0, pageSize: 10 } }
        }}
        pageSizeOptions={[10, 25, 50]}
      />
    </>
  );
};

const getDeviceDeploymentsForSerial = (deployments: TelemetryDeployment[], serial: string) =>
  deployments.filter((dep) => dep.device_key?.split(':')[1] === serial);

const isDeploymentActive = (deployment: TelemetryDeployment) => {
  const now = dayjs();
  const start = combineDateTime(deployment.attachment_start_date, deployment.attachment_start_time);
  const end = deployment.attachment_end_date
    ? combineDateTime(deployment.attachment_end_date, deployment.attachment_end_time)
    : null;
  return now.isAfter(start) && (!end || now.isBefore(end));
};
