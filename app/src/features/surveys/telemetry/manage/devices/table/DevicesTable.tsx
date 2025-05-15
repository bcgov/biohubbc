import { mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { FOREIGN_KEY_CONSTRAINT_ERROR } from 'constants/errors';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { TelemetryDevice } from 'interfaces/useTelemetryDeviceApi.interface';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export interface IDeviceRowData {
  id: number;
  device_id: number;
  serial: string;
  device_make_id: number;
  model: string | null;
  comment: string | null;
}

interface IDevicesTableProps {
  devices: TelemetryDevice[];
  selectedRows: GridRowSelectionModel;
  setSelectedRows: (selection: GridRowSelectionModel) => void;
  /**
   * Callback fired when a deployment is deleted.
   */
  onDelete?: () => void;
}

/**
 * Returns a table of telemetry devices.
 *
 * @param {IDevicesTableProps} props
 * @return {*}
 */
export const DevicesTable = (props: IDevicesTableProps) => {
  const { devices, selectedRows, setSelectedRows, onDelete } = props;

  const biohubApi = useBiohubApi();

  const codesContext = useCodesContext();
  const dialogContext = useDialogContext();
  const surveyContext = useSurveyContext();

  const [actionMenuDeviceId, setActionMenuDeviceId] = useState<number | undefined>();
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<MenuProps['anchorEl']>(null);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const handleCloseActionMenu = () => {
    setActionMenuAnchorEl(null);
  };

  const handleDeleteDevice = async () => {
    if (!actionMenuDeviceId) {
      return;
    }

    await biohubApi.telemetryDevice
      .deleteDevice(surveyContext.surveyId, actionMenuDeviceId)
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
                <strong>Error Deleting Device</strong>
              </Typography>
              {String(error).includes(FOREIGN_KEY_CONSTRAINT_ERROR) ? (
                <Typography variant="body2" component="div">
                  You must delete the deployments involving this device before deleting the device.
                </Typography>
              ) : (
                <Typography variant="body2" component="div">
                  {String(error)}
                </Typography>
              )}
            </>
          ),
          open: true
        });
      });
  };

  /**
   * Display the delete device dialog.
   */
  const deleteDeviceDialog = () => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Delete device?',
      dialogText: 'Are you sure you want to permanently delete this device?',
      yesButtonLabel: 'Delete Device',
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
        handleDeleteDevice();
      }
    });
  };

  const rows: IDeviceRowData[] = devices.map((device) => ({
    id: device.device_id,
    device_id: device.device_id,
    serial: device.serial,
    device_make_id: device.device_make_id,
    model: device.model,
    comment: device.comment
  }));

  const columns: GridColDef<IDeviceRowData>[] = [
    {
      field: 'device_id',
      headerName: 'Device ID',
      description: 'The unique key for the device',
      width: 85,
      minWidth: 85,
      renderHeader: (params) => (
        <Tooltip title={params.colDef.description}>
          <Typography color={grey[500]} variant="body2" fontWeight={700}>
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
      description: 'The serial number of the device',
      flex: 1
    },
    {
      field: 'device_make_id',
      headerName: 'Make',
      description: 'The manufacturer of the device',
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {codesContext.codesDataLoader.data?.telemetry_device_makes.find(
            (deviceMake) => deviceMake.id === params.row.device_make_id
          )?.name ?? null}
        </Box>
      )
    },
    {
      field: 'model',
      headerName: 'Model',
      description: 'The model of the device',
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
      renderCell: (params) => {
        return (
          <Box position="fixed">
            <IconButton
              onClick={(event) => {
                setActionMenuDeviceId(params.row.device_id);
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
            to={`/admin/surveys/${surveyContext.surveyId}/telemetry/manage/device/${actionMenuDeviceId}/edit`}>
            <ListItemIcon>
              <Icon path={mdiPencilOutline} size={1} />
            </ListItemIcon>
            <ListItemText>Edit Details</ListItemText>
          </RouterLink>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleCloseActionMenu();
            deleteDeviceDialog();
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
        getRowId={(row: IDeviceRowData) => row.id}
        columns={columns}
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={setSelectedRows}
        checkboxSelection
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 }
          }
        }}
        pageSizeOptions={[10, 25, 50]}
      />
    </>
  );
};
