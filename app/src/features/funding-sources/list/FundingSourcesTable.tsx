import { mdiInformationOutline, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import { grey } from '@mui/material/colors';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { DataGrid, GridActionsCellItem, GridColDef, GridOverlay } from '@mui/x-data-grid';
import { IGetFundingSourcesResponse } from 'interfaces/useFundingSourceApi.interface';
import { useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFormattedAmount } from 'utils/Utils';

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
  openEditModal: (fundingSourceId: number) => void;
}

interface IFundingSourcesTableEntry {
  funding_source_id: number;
  name: string;
  survey_reference_count: number;
  survey_reference_amount_total: number;
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

  const handleViewDetails = (row: IFundingSourcesTableEntry) => {
    // TOOD
  };

  const handleEdit = (row: IFundingSourcesTableEntry) => {
    props.openEditModal(row.funding_source_id);
  };

  const handleDelete = (row: IFundingSourcesTableEntry) => {
    // TOOD
  };

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
      getActions: (params) => {
        return [
          <GridActionsCellItem
            icon={<Icon path={mdiInformationOutline} size={1} />}
            label="View Details"
            onClick={() => handleViewDetails(params.row)}
            showInMenu
          />,
          <GridActionsCellItem
            icon={<Icon path={mdiPencilOutline} size={1} />}
            label="Edit"
            onClick={() => handleEdit(params.row)}
            showInMenu
          />,
          <GridActionsCellItem
            icon={<Icon path={mdiTrashCanOutline} size={1} />}
            label="Delete"
            onClick={() => handleDelete(params.row)}
            showInMenu
          />
        ];
      }
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
    />
  );
};

export default FundingSourcesTable;
