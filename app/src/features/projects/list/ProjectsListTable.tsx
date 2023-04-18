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
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ProjectStatusType } from 'constants/misc';
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
    color: 'white'
  },
  chipActive: {
    backgroundColor: theme.palette.success.main
  },
  chipCompleted: {
    backgroundColor: theme.palette.success.main
  },
  chipDraft: {
    backgroundColor: theme.palette.info.main
  }
}));

export interface IProjectsListTableProps {
  projects: IGetProjectsListResponse[];
  drafts: IGetDraftsListResponse[];
}

const ProjectsListTable: React.FC<IProjectsListTableProps> = (props) => {
  const classes = useStyles();

  const { projects, drafts } = props;
  const hasProjects = projects.length > 0;
  const hasDrafts = drafts?.length > 0;

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (ProjectStatusType.ACTIVE === status_name) {
      chipLabel = 'Active';
      chipStatusClass = classes.chipActive;
    } else if (ProjectStatusType.COMPLETED === status_name) {
      chipLabel = 'Completed';
      chipStatusClass = classes.chipCompleted;
    } else if (ProjectStatusType.DRAFT === status_name) {
      chipLabel = 'Draft';
      chipStatusClass = classes.chipDraft;
    }

    return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };

  if (!hasProjects && !hasDrafts) {
    return (
      <TableContainer>
        <Table className={classes.projectsTable}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Contact Agency</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6}>
                <Box display="flex" justifyContent="center">
                  No Results
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  } else {
    return (
      <TableContainer>
        <Table className={classes.projectsTable}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact Agency</TableCell>
              <TableCell width={150}>Type</TableCell>
              <TableCell width={150}>Status</TableCell>
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
                <TableCell />
                <TableCell>{getChipIcon('Draft')}</TableCell>
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
                <TableCell>{project.projectData.coordinator_agency}</TableCell>
                <TableCell>{project.projectData.project_type}</TableCell>
                <TableCell>{getChipIcon(project.projectData.completion_status)}</TableCell>
                <TableCell>
                  {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.projectData.start_date)}
                </TableCell>
                <TableCell>
                  {getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, project.projectData.end_date)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
};

export default ProjectsListTable;
