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
import React, { useCallback } from 'react';
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
  noDataText: {
    fontFamily: 'inherit !important'
  },
  dataGrid: {
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

const NoRowsOverlay = (props: { className: string }) => (
  <GridOverlay>
    <Typography className={props.className}>No Results</Typography>
  </GridOverlay>
);

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

        //TODO: PRODUCTION_BANDAGE: Remove <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
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
      valueGetter: ({ value }) => (value ? new Date(value) : undefined),
      valueFormatter: ({ value }) => (value ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, value) : undefined),
      flex: 1
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      valueGetter: ({ value }) => (value ? new Date(value) : undefined),
      valueFormatter: ({ value }) => (value ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, value) : undefined),
      flex: 1
    }
  ];

  const NoRowsOverlayStyled = useCallback(() => <NoRowsOverlay className={classes.noDataText} />, [classes.noDataText]);

  return (
    <DataGrid
      className={classes.dataGrid}
      autoHeight
      rows={[
        ...props.drafts.map((draft: IGetDraftsListResponse) => ({
          id: draft.id,
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
          isDraft: false
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
