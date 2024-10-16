import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { IAlert } from 'interfaces/useAlertApi.interface';
import { getFormattedAmount } from 'utils/Utils';
import AlertTableActionsMenu from './components/AlertTableActionsMenu';

export interface IAlertTableTableProps {
  alerts: IAlert[];
  onView: (alertId: number) => void;
  onEdit: (alertId: number) => void;
  onDelete: (alertId: number) => void;
}

export interface IAlertTableEntry {
  funding_source_id: number;
  name: string;
  survey_reference_count: number;
  survey_reference_amount_total: number;
}

const AlertTable = (props: IAlertTableTableProps) => {
  const columns: GridColDef<IAlertTableEntry>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1
    },
    {
      field: 'survey_reference_amount_total',
      headerName: 'Amount Distributed',
      description: 'Known amount of funding that has been distributed to one or more surveys.',
      flex: 1,
      headerAlign: 'right',
      align: 'right',
      valueGetter: (params) => {
        return getFormattedAmount(params.value, { maximumFractionDigits: 2 });
      }
    },
    {
      field: 'survey_reference_count',
      headerName: 'Surveys',
      description: 'Number of surveys that reference this funding source.',
      flex: 1,
      headerAlign: 'right',
      align: 'right'
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      flex: 1,
      align: 'right',
      renderCell: (params) => (
        <AlertTableActionsMenu
          alertId={params.row.funding_source_id}
          onView={props.onView}
          onEdit={props.onEdit}
          onDelete={props.onDelete}
        />
      )
    }
  ];

  return (
    <StyledDataGrid
      noRowsMessage={'No funding sources found'}
      autoHeight
      rows={props.alerts}
      getRowId={(row) => `funding-source-${row.funding_source_id}`}
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
      data-testid="funding-source-table"
    />
  );
};

export default AlertTable;
