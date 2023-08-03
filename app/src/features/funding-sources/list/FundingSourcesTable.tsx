import { Theme } from '@mui/material';
import { grey } from '@mui/material/colors';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { DataGrid, GridColDef, GridOverlay } from '@mui/x-data-grid';
import { IGetFundingSourcesResponse } from 'interfaces/useFundingSourceApi.interface';
import { useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
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
}

interface IFundingSourcesTableEntry {
  funding_source_id: number;
  name: string;
  description: string;
}

const NoRowsOverlay = (props: { className: string }) => (
  <GridOverlay>
    <Typography className={props.className} color="textSecondary">
      No funding sources found
    </Typography>
  </GridOverlay>
);

const FundingSourcesTable = (props: IFundingSourcesTableTableProps) => {
  const classes = useStyles();

  const columns: GridColDef<IFundingSourcesTableEntry>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Link
          style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
          data-testid={params.row.name}
          underline="always"
          title={params.row.name}
          component={RouterLink}
          to={`/admin/funding-sources/edit?fundingSourceId=${params.row.funding_source_id}`}
          children={params.row.name}
        />
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1
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
      components={{
        NoRowsOverlay: NoRowsOverlayStyled
      }}
    />
  );
};

export default FundingSourcesTable;
