import { Box } from '@mui/material';
import { green, red } from '@mui/material/colors';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import AlertBar from 'components/alert/AlertBar';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import dayjs from 'dayjs';
import { useCodesContext } from 'hooks/useContext';
import { AlertSeverity } from 'interfaces/useAlertApi.interface';
import AlertTableActionsMenu from './components/AlertTableActionsMenu';

const pageSizeOptions = [5, 10, 25];

export interface IAlertTableRow {
  id: number;
  alert_type_id: number;
  severity: AlertSeverity;
  name: string;
  message: string;
  data: object | null;
  record_end_date: string | null;
  status: 'expired' | 'active';
}

interface IAlertTableProps {
  alerts: IAlertTableRow[];
  rowCount: number;
  paginationModel: GridPaginationModel;
  setPaginationModel: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  setSortModel: (model: GridSortModel) => void;
  onEdit: (alertId: number) => void;
  onDelete: (alertId: number) => void;
}

const AlertTable = (props: IAlertTableProps) => {
  const codesContext = useCodesContext();

  const { alerts, rowCount, paginationModel, setPaginationModel, sortModel, setSortModel, onEdit, onDelete } = props;

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
      headerName: 'Page',
      headerAlign: 'left',
      align: 'left',
      width: 150,
      renderCell: (params) =>
        codesContext.codesDataLoader.data?.alert_types.find((type) => type.id === params.row.alert_type_id)?.name ??
        params.row.alert_type_id
    },
    {
      field: 'record_end_date',
      headerName: 'Expiry date',
      headerAlign: 'left',
      align: 'left',
      width: 150,
      renderCell: (params) =>
        params.row.record_end_date ? dayjs(params.row.record_end_date).format('YYYY-MM-DD') : null
    },
    {
      field: 'status',
      headerName: 'Status',
      headerAlign: 'center',
      align: 'center',
      width: 150,
      renderCell: (params) => (
        <ColouredRectangleChip colour={params.row.status === 'active' ? green : red} label={params.row.status} />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      align: 'right',
      flex: 0,
      renderCell: (params) => <AlertTableActionsMenu alertId={params.row.id} onEdit={onEdit} onDelete={onDelete} />
    }
  ];

  return (
    <StyledDataGrid
      noRowsMessage="No alerts found"
      rows={alerts}
      columns={columns}
      rowCount={rowCount}
      getRowHeight={() => 'auto'}
      pagination
      paginationModel={paginationModel}
      getRowId={(row) => row.alert_id}
      pageSizeOptions={[...pageSizeOptions]}
      onPaginationModelChange={setPaginationModel}
      paginationMode="server"
      sortingMode="server"
      sortModel={sortModel}
      onSortModelChange={setSortModel}
      sortingOrder={['asc', 'desc']}
    />
  );
};

export default AlertTable;
