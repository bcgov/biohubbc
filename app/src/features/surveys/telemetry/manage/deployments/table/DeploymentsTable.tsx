import { mdiDotsVertical, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import blue from '@mui/material/colors/blue';
import green from '@mui/material/colors/green';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { FOREIGN_KEY_CONSTRAINT_ERROR } from 'constants/errors';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useDialogContext, useSurveyContext } from 'hooks/useContext';
import { TelemetryDeployment } from 'interfaces/useTelemetryDeploymentApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { combineDateTime, formatDateTime } from 'utils/datetime';

dayjs.extend(isBetween);

export interface IDeploymentRowData {
  id: number;
  deployment_id: number;
  critter_id: number;
  device_id: number;
  device_key: string;
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

  const codesLoadRef = useRef(codesContext.codesDataLoader.load);
  codesLoadRef.current = codesContext.codesDataLoader.load;
  useEffect(() => {
    codesLoadRef.current();
  }, []);

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
              {String(error).includes(FOREIGN_KEY_CONSTRAINT_ERROR) ? (
                <Typography variant="body2" component="div">
                  You must delete telemetry data from this deployment before deleting the deployment.
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
    id: deployment.deployment_id,
    deployment_id: deployment.deployment_id,
    critter_id: deployment.critter_id,
    device_id: deployment.device_id,
    device_key: deployment.device_key,
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
      field: 'deployment_id',
      headerName: 'Deployment ID',
      description: 'The unique key for the deployment',
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
          {params.row.deployment_id}
        </Typography>
      )
    },
    {
      field: 'critter_id',
      headerName: 'Animal',
      description: 'The nickname of the animal that the device is on',
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
      field: 'device_key',
      headerName: 'Device',
      description: 'The serial number and make of the device that is deployed',
      flex: 1,
      renderCell: (params) => {
        const [vendor, serial] = params.row.device_key.split(':');
        return (
          <Typography variant="body2">
            {serial}
            <Typography fontSize="inherit" color="textSecondary" component="span" display="block">
              {vendor}
            </Typography>
          </Typography>
        );
      }
    },
    {
      field: 'frequency',
      headerName: 'Frequency',
      description: 'The frequency of the device',
      flex: 1,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.frequency}&nbsp;
          {codesContext.codesDataLoader.data?.frequency_units.find(
            (frequencyUnit) => frequencyUnit.id === params.row.frequency_unit_id
          )?.name ?? null}
        </Typography>
      )
    },
    {
      field: 'attachment_start_date',
      headerName: 'Start',
      description: 'The start date of the deployment',
      flex: 1,
      renderCell: (params) => formatDateTime(params.row.attachment_start_date)
    },
    {
      field: 'attachment_end_date',
      headerName: 'End',
      description: 'The end date of the deployment',
      flex: 1,
      renderCell: (params) => (params.row.attachment_end_date ? formatDateTime(params.row.attachment_end_date) : null)
    },
    {
      field: 'status',
      headerName: 'Status',
      description: 'The status of the deployment, based on whether the end date has passed',
      flex: 1,
      renderCell: (params) => {
        const now = dayjs();
        const start = combineDateTime(params.row.attachment_start_date, params.row.attachment_start_time);
        const end =
          params.row.attachment_end_date &&
          combineDateTime(params.row.attachment_end_date, params.row.attachment_end_time);

        if (now.isBefore(start)) {
          return <ColouredRectangleChip colour={grey} label="Future" />;
        }

        if (end && now.isAfter(end)) {
          return <ColouredRectangleChip colour={blue} label="Ended" />;
        }

        if (!end || now.isBetween(start, end, null, '[)')) {
          return <ColouredRectangleChip colour={green} label="Active" />;
        }

        return null;
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
                setActionMenuDeploymentId(params.row.deployment_id);
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
            paginationModel: { page: 0, pageSize: 10 }
          }
        }}
        pageSizeOptions={[10, 25, 50]}
      />
    </>
  );
};
