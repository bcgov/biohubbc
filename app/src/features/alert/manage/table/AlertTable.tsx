import { green } from '@mui/material/colors';
import { GridColDef } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import dayjs from 'dayjs';
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
  name: string;
  message: string;
  type: string;
  data: object | null;
  record_end_date: string | null;
  status: 'active' | 'expired';
}

const AlertTable = (props: IAlertTableTableProps) => {
  const rows: IAlertTableRow[] = props.alerts.map((alert) => ({ ...alert, id: alert.alert_id }));

  const columns: GridColDef<IAlertTableRow>[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 250
    },
    {
      field: 'message',
      headerName: 'Message',
      flex: 1
    },
    {
      field: 'type',
      headerName: 'Type',
      description: 'Type of the alert.',
      width: 150,
    },
    {
      field: 'record_end_date',
      headerName: 'End date',
      description: 'Status of the alert.',
      headerAlign: 'left',
      align: 'left',
      width: 200,
      renderCell: (params) => (
        <>
          {params.row.record_end_date ? dayjs(params.row.record_end_date).format(DATE_FORMAT.MediumDateFormat) : null}
        </>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      description: 'Status of the alert.',
      headerAlign: 'center',
      align: 'center',
      width: 100,
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
