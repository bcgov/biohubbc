import { makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { grey } from '@mui/material/colors';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import clsx from 'clsx';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
import { SystemRoleGuard } from 'components/security/Guards';
import { PublishStatus } from 'constants/attachments';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SYSTEM_ROLE } from 'constants/roles';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetProjectsListResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
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
  chip: {
    minWidth: '7rem',
    fontSize: '11px',
    textTransform: 'uppercase'
  },
  chipDraft: {
    borderColor: '#afd3ee',
    backgroundColor: 'rgb(232, 244, 253)'
  },
  MuiDataGrid: {
    fontSize: '0.9rem',
    border: '0 !important',
    fontFamily: 'inherit !important',
    '& .MuiDataGrid-columnHeaders': {
      fontSize: '0.875rem',
      fontWeight: 700,
      color: grey[600]
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      textTransform: 'uppercase',
      fontWeight: '700 !important',
      letterSpacing: '0.02rem'
    },
    '& .MuiLink-root': {
      fontFamily: 'inherit',
      fontSize: 'inherit'
    },
    '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cellCheckbox:focus-within, & .MuiDataGrid-columnHeader:focus-within': {
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

//TODO: PRODUCTION_BANDAGE: Remove <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>

const ProjectsListTable = (props: IProjectsListTableProps) => {
  const classes = useStyles();

  const columns: GridColDef<IProjectsListTableEntry>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 3,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Link
          className={classes.linkButton}
          data-testid={params.row.name}
          underline="always"
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
      flex: 3
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => {
        if (params.row.isDraft) {
          return <Chip variant="outlined" className={clsx(classes.chip, classes.chipDraft)} label={'Draft'} />;
        }

        if (!params.row.status) {
          return <></>;
        }

        return (
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
            <SubmitStatusChip status={params.row.status} />
          </SystemRoleGuard>
        );
      }
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      valueGetter: ({ value }) => value && new Date(value),
      valueFormatter: ({ value }) => getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, value),
      flex: 1
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      valueGetter: ({ value }) => value && new Date(value),
      valueFormatter: ({ value }) => getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, value),
      flex: 1
    }
  ];

  const { projects, drafts } = props;
  const hasProjects = projects.length > 0;
  const hasDrafts = drafts?.length > 0;

  return (
    <DataGrid
      className={classes.MuiDataGrid}
      autoHeight
      rows={[
        ...drafts.map((draft: IGetDraftsListResponse) => ({
          id: draft.id,
          name: draft.name,
          isDraft: true
        })),
        ...projects.map((project: IGetProjectsListResponse) => ({
          id: project.projectData.id,
          name: project.projectData.name,
          status: project.projectSupplementaryData.publishStatus,
          type: project.projectData.project_type,
          startDate: project.projectData.start_date,
          endDate: project.projectData.end_date,
          isDraft: false
        }))
      ]}
      columns={columns}
      pageSizeOptions={[5]}
      rowSelection={false}
      checkboxSelection={false}
      disableRowSelectionOnClick
      disableColumnSelector
      disableColumnFilter
      disableColumnMenu
      sortingOrder={['asc', 'desc']}
      initialState={{
        pagination: {
          paginationModel: {
            pageSize: 5
          }
        }
      }}
      /*
      slots={{
        noRowsOverlay: NoArtifactRowsOverlay
      }}
      */
    />
  );

  if (!hasProjects && !hasDrafts) {
    return (
      <TableContainer>
        <Table className={classes.projectsTable}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <SystemRoleGuard
                validSystemRoles={[
                  SYSTEM_ROLE.DATA_ADMINISTRATOR,
                  SYSTEM_ROLE.SYSTEM_ADMIN,
                  SYSTEM_ROLE.PROJECT_CREATOR
                ]}>
                <TableCell width={150}>Status</TableCell>
              </SystemRoleGuard>
              <TableCell width={150}>Start Date</TableCell>
              <TableCell width={150}>End Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={5}>
                <Box display="flex" justifyContent="center">
                  No Results
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table className={classes.projectsTable}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell width={150}>
              <SystemRoleGuard
                validSystemRoles={[
                  SYSTEM_ROLE.DATA_ADMINISTRATOR,
                  SYSTEM_ROLE.SYSTEM_ADMIN,
                  SYSTEM_ROLE.PROJECT_CREATOR
                ]}>
                Status
              </SystemRoleGuard>
            </TableCell>
            <TableCell width={150}>Start Date</TableCell>
            <TableCell width={150}>End Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody data-testid="project-table">
          {drafts?.map((draft: IGetDraftsListResponse) => (
            <TableRow key={draft.id}>
              <TableCell>
                <Link
                  className={classes.linkButton}
                  data-testid={draft.name}
                  underline="always"
                  component={RouterLink}
                  to={`/admin/projects/create?draftId=${draft.id}`}>
                  {draft.name}
                </Link>
              </TableCell>
              <TableCell />
              <TableCell>
                <Chip variant="outlined" className={clsx(classes.chip, classes.chipDraft)} label={'Draft'} />
              </TableCell>
              <TableCell />
              <TableCell />
            </TableRow>
          ))}
          {projects?.map((project: IGetProjectsListResponse) => (
            <TableRow key={project.projectData.id}>
              <TableCell>
                <Link
                  className={classes.linkButton}
                  data-testid={project.projectData.name}
                  underline="always"
                  component={RouterLink}
                  to={`/admin/projects/${project.projectData.id}`}>
                  {project.projectData.name}
                </Link>
              </TableCell>
              <TableCell>{project.projectData.project_type}</TableCell>
              <TableCell>
                <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
                  <SubmitStatusChip status={project.projectSupplementaryData.publishStatus} />
                </SystemRoleGuard>
              </TableCell>
              <TableCell>
                {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.projectData.start_date)}
              </TableCell>
              <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.projectData.end_date)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ProjectsListTable;
