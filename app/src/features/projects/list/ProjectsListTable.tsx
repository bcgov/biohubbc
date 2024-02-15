import { Theme } from '@mui/material';
import { grey } from '@mui/material/colors';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { DataGrid, GridColDef, GridOverlay } from '@mui/x-data-grid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IProjectsListItemData } from 'interfaces/useProjectApi.interface';
import { useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFormattedDate } from 'utils/Utils';

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

interface IProjectsListTableRow extends Omit<IProjectsListItemData, 'project_programs'> {
  project_programs: string;
}

export interface IProjectsListTableProps {
  projects: IProjectsListTableRow[];
}

const NoRowsOverlay = (props: { className: string }) => (
  <GridOverlay>
    <Typography className={props.className} color="textSecondary">
      No projects found
    </Typography>
  </GridOverlay>
);

const ProjectsListTable = (props: IProjectsListTableProps) => {
  const classes = useStyles();

  const columns: GridColDef<IProjectsListTableRow>[] = [
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
          to={
            `/admin/projects/${params.row.project_id}`
          }
          children={params.row.name}
        />
      )
    },
    {
      field: 'project_programs',
      headerName: 'Programs',
      flex: 1
    },
    {
      field: 'regions',
      headerName: 'Regions',
      flex: 1
    },
    {
      field: 'start_date',
      headerName: 'Start Date',
      minWidth: 150,
      valueGetter: ({ value }) => (value ? new Date(value) : undefined),
      valueFormatter: ({ value }) => (value ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, value) : undefined)
    },
    {
      field: 'end_date',
      headerName: 'End Date',
      minWidth: 150,
      valueGetter: ({ value }) => (value ? new Date(value) : undefined),
      valueFormatter: ({ value }) => (value ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, value) : undefined)
    }
  ];

  const NoRowsOverlayStyled = useCallback(() => <NoRowsOverlay className={classes.noDataText} />, [classes.noDataText]);

  return (
    <DataGrid
      className={classes.dataGrid}
      autoHeight
      rows={props.projects}
      getRowId={(row) => row.project_id}
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

export default ProjectsListTable;
