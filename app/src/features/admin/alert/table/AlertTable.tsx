import Box from '@mui/material/Box';
import { green } from '@mui/material/colors';
import { GridColDef } from '@mui/x-data-grid';
import AlertBar from 'components/alert/AlertBar';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
import { useCodesContext } from 'hooks/useContext';
import { IAlert } from 'interfaces/useAlertApi.interface';
import AlertTableActionsMenu from './components/AlertTableActionsMenu';

export interface IAlertTableTableProps {
  alerts: IAlert[];
  onView: (alertId: number) => void;
  onEdit: (alertId: number) => void;
  onDelete: (alertId: number) => void;
}

export interface IAlertTableRow {
  id: number;
  alert_type_id: number;
  severity: 'info' | 'warning' | 'error' | 'warning';
  name: string;
  message: string;
  data: object | null;
  record_end_date: string | null;
  status: 'expired' | 'active';
}

/**
 * Data grid table displaying alerts created by system administrators
 *
 */
const AlertTable = (props: IAlertTableTableProps) => {
  const codesContext = useCodesContext();

  const rows: IAlertTableRow[] = props.alerts.map((alert) => ({ ...alert, id: alert.alert_id }));

  const columns: GridColDef<IAlertTableRow>[] = [
    {
      field: 'preview',
      headerName: 'Alert',
      flex: 1,
      renderCell: (params) => (
        <Box flex={0.9}>
          <AlertBar
            severity={params.row.severity}
            text={params.row.message}
            title={params.row.name}
            variant="outlined"
          />
        </Box>
      )
    },
    {
      field: 'alert_type_id',
      headerName: 'Type',
      description: 'Type of the alert.',
      headerAlign: 'left',
      align: 'left',
      width: 150,
      renderCell: (params) =>
        codesContext.codesDataLoader.data?.alert_types.find((code) => code.id === params.row.id)?.name
    },
    {
      field: 'record_end_date',
      headerName: 'Expiry date',
      description: 'Status of the alert.',
      headerAlign: 'left',
      align: 'left',
      width: 150,
      renderCell: (params) =>
        params.row.record_end_date ? dayjs(params.row.record_end_date).format(DATE_FORMAT.MediumDateFormat) : null
    },
    {
      field: 'status',
      headerName: 'Status',
      description: 'Status of the alert.',
      headerAlign: 'center',
      align: 'center',
      width: 150,
      renderCell: (params) => <ColouredRectangleChip colour={green} label={params.row.status} />
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      align: 'right',
      flex: 0,
      renderCell: (params) => (
        <AlertTableActionsMenu
          alertId={params.row.id}
          onView={props.onView}
          onEdit={props.onEdit}
          onDelete={props.onDelete}
        />
      )
    }
  ];

  return (
    <StyledDataGrid
      noRowsMessage={'No alerts found'}
      autoHeight
      getRowHeight={() => 'auto'}
      rows={rows}
      getRowId={(row) => `alert-${row.alert_id}`}
      columns={columns}
      pageSizeOptions={[5]}
      rowSelection={false}
      checkboxSelection={false}
      hideFooter
      disableRowSelectionOnClick
      disableColumnSelector
      disableColumnFilter
      disableColumnMenu
      sortingOrder={['asc', 'desc']}
      data-testid="alert-table"
    />
  );
};

export default AlertTable;
