import { makeStyles, Theme } from '@material-ui/core';
import Chip from '@material-ui/core/Chip';
import { grey } from '@material-ui/core/colors';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { DataGrid, GridColDef, GridOverlay } from '@mui/x-data-grid';
import clsx from 'clsx';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
import { SystemRoleGuard } from 'components/security/Guards';
import { PublishStatus } from 'constants/attachments';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SYSTEM_ROLE } from 'constants/roles';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetProjectsListResponse } from 'interfaces/useProjectApi.interface';
import { useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFormattedDate } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  projectsTable: {
    tableLayout: 'fixed'
  },
  chip: {
    textTransform: 'uppercase'
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
}

interface IProjectsListTableEntry {
  id: number;
  isDraft: boolean;
  name: string;
  status?: PublishStatus;
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
      field: 'type',
      headerName: 'Type',
      flex: 1,
      resizable: true
    },
    {
      field: 'regions',
      headerName: 'Regions',
      flex: 1,
      valueFormatter: ({ value }) => value.join(', ')
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
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 150,
      renderCell: (params) => {
        if (params.row.isDraft) {
          return <Chip className={clsx(classes.chip)} label={'Draft'} />;
        }

        if (!params.row.status) {
          return <></>;
        }

        //TODO: PRODUCTION_BANDAGE: Remove <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
        return (
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
            <SubmitStatusChip status={params.row.status} />
          </SystemRoleGuard>
        );
      }
    }
  ];

  const NoRowsOverlayStyled = useCallback(() => <NoRowsOverlay className={classes.noDataText} />, [classes.noDataText]);

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
          status: project.projectSupplementaryData.publishStatus,
          type: project.projectData.project_type,
          startDate: project.projectData.start_date,
          endDate: project.projectData.end_date,
          isDraft: false,
          regions: project.projectData.regions
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
