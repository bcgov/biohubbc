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
import clsx from 'clsx';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
import { SystemRoleGuard } from 'components/security/Guards';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { BioHubSubmittedStatusType } from 'constants/misc';
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
  }
}));

export interface IProjectsListTableProps {
  projects: IGetProjectsListResponse[];
  drafts: IGetDraftsListResponse[];
}

//TODO: PRODUCTION_BANDAGE: Remove <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>

const ProjectsListTable: React.FC<IProjectsListTableProps> = (props) => {
  const classes = useStyles();

  const { projects, drafts } = props;
  const hasProjects = projects.length > 0;
  const hasDrafts = drafts?.length > 0;

  function getProjectSubmissionStatus(project: IGetProjectsListResponse): BioHubSubmittedStatusType {
    if (project.projectSupplementaryData.has_unpublished_content) {
      return BioHubSubmittedStatusType.UNSUBMITTED;
    }
    return BioHubSubmittedStatusType.SUBMITTED;
  }

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
                  <SubmitStatusChip status={getProjectSubmissionStatus(project)} />
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
