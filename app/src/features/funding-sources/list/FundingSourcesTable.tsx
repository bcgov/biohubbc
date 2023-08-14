import { grey } from '@mui/material/colors';
import { makeStyles } from '@mui/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { IGetFundingSourcesResponse } from 'interfaces/useFundingSourceApi.interface';
import { useCallback } from 'react';
import { getFormattedAmount } from 'utils/Utils';
import TableActionsMenu from './FundingSourcesTableActionsMenu';
import NoRowsOverlay from './FundingSourcesTableNoRowsOverlay';

const useStyles = makeStyles(() => ({
  projectsTable: {
    tableLayout: 'fixed'
  },
  linkButton: {
    textAlign: 'left',
    fontWeight: 700
  },
  noDataText: {
    fontFamily: 'inherit !important',
    fontSize: '0.875rem',
    fontWeight: 700
  },
  dataGrid: {
    border: 'none !important',
    fontFamily: 'inherit !important',
    '& .MuiDataGrid-columnHeaderTitle': {
      textTransform: 'uppercase',
      fontSize: '0.875rem',
      fontWeight: 700,
      color: grey[600]
    },
    '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cellCheckbox:focus-within, & .MuiDataGrid-columnHeader:focus-within':
      {
        outline: 'none !important'
      },
    '& .MuiDataGrid-row:hover': {
      backgroundColor: 'transparent !important'
    }
  }
}));

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
  survey_reference_amount_total: number;
}

const FundingSourcesTable = (props: IFundingSourcesTableTableProps) => {
  const classes = useStyles();

  const columns: GridColDef<IFundingSourcesTableEntry>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1
    },
    {
      field: 'survey_reference_amount_total',
      headerName: 'Amount Distributed',
      flex: 1,
      valueGetter: (params) => {
        return getFormattedAmount(params.value, { maximumFractionDigits: 2 });
      }
    },
    {
      field: 'survey_reference_count',
      headerName: 'Surveys',
      flex: 1
    },
    {
      field: 'actions',
      type: 'actions',
      sortable: false,
      renderCell: (params) => (
        <TableActionsMenu {...params} onView={props.onView} onEdit={props.onEdit} onDelete={props.onDelete} />
      )
    }
  ];

  const NoRowsOverlayStyled = useCallback(() => <NoRowsOverlay className={classes.noDataText} />, [classes.noDataText]);

  return (
    <DataGrid
      className={classes.dataGrid}
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
      slots={{
        noRowsOverlay: NoRowsOverlayStyled
      }}
      data-testid="funding-source-table"
    />
  );
};

export default FundingSourcesTable;
