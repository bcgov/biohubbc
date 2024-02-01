import { Theme } from '@mui/material';
import { grey } from '@mui/material/colors';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { DataGrid, GridColDef, GridOverlay } from '@mui/x-data-grid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetProjectsListResponse } from 'interfaces/useProjectApi.interface';
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

export interface IProjectsListTableProps {
  projects: IGetProjectsListResponse[];
  drafts: IGetDraftsListResponse[];
  codes: IGetAllCodeSetsResponse;
}

interface IProjectsListTableEntry {
  id: number;
  isDraft: boolean;
  name: string;
  type?: string;
  startDate?: string;
  endDate?: string;
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

  const columns: GridColDef<IProjectsListTableEntry>[] = [
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
            params.row.isDraft ? `/admin/projects/create?draftId=${params.row.id}` : `/admin/projects/${params.row.id}`
          }
          children={params.row.name}
        />
      )
    },
    {
      field: 'program',
      headerName: 'Programs',
      flex: 1
    },
    {
      field: 'regions',
      headerName: 'Regions',
      flex: 1
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      minWidth: 150,
      valueGetter: ({ value }) => (value ? new Date(value) : undefined),
      valueFormatter: ({ value }) => (value ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, value) : undefined)
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      minWidth: 150,
      valueGetter: ({ value }) => (value ? new Date(value) : undefined),
      valueFormatter: ({ value }) => (value ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, value) : undefined)
    }
  ];

  const NoRowsOverlayStyled = useCallback(() => <NoRowsOverlay className={classes.noDataText} />, [classes.noDataText]);

  const getProjectPrograms = (project: IGetProjectsListResponse) => {
    return (
      props.codes.program
        .filter((code) => project.projectData.project_programs.includes(code.id))
        .map((code) => code.name)
        .join(', ') || ''
    );
  };
  return (
    <DataGrid
      className={classes.dataGrid}
      autoHeight
      rows={[
        ...props.drafts.map((draft: IGetDraftsListResponse) => ({
          id: draft.webform_draft_id,
          name: draft.name,
          isDraft: true
        })),
        ...props.projects.map((project: IGetProjectsListResponse) => ({
          id: project.projectData.id,
          name: project.projectData.name,
          program: getProjectPrograms(project),
          startDate: project.projectData.start_date,
          endDate: project.projectData.end_date,
          isDraft: false,
          regions: project.projectData.regions?.join(', ')
        }))
      ]}
      getRowId={(row) => (row.isDraft ? `draft-${row.id}` : `project-${row.id}`)}
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
