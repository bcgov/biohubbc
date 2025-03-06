import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { IGetFundingSourcesResponse } from 'interfaces/useFundingSourceApi.interface';
import TableActionsMenu from './FundingSourcesTableActionsMenu';

export interface IFundingSourcesTableTableProps {
  fundingSources: IGetFundingSourcesResponse[];
  onView: (fundingSourceId: number) => void;
  onEdit: (fundingSourceId: number) => void;
  onDelete: (fundingSourceId: number) => void;
}

export interface IFundingSourcesTableEntry {
  funding_source_id: number;
  name: string;
  survey_reference_count: number;
}

const FundingSourcesTable = (props: IFundingSourcesTableTableProps) => {
  const columns: GridColDef<IFundingSourcesTableEntry>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1
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
        <TableActionsMenu
          fundingSourceId={params.row.funding_source_id}
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
      rows={props.fundingSources}
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

export default FundingSourcesTable;
