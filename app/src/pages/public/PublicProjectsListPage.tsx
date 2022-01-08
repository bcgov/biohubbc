import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import Link from '@material-ui/core/Link';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { AuthStateContext } from 'contexts/authStateContext';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectsListResponse } from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useState } from 'react';
import { Redirect, useHistory } from 'react-router';
import { getFormattedDate } from 'utils/Utils';
import { ProjectStatusType } from 'constants/misc';
import clsx from 'clsx';
import Chip from '@material-ui/core/Chip';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme: Theme) => ({
  chip: {
    padding: '0px 8px',
    borderRadius: '4px',
    color: 'white'
  },
  chipActive: {
    backgroundColor: theme.palette.warning.main
  },
  chipCompleted: {
    backgroundColor: theme.palette.success.main
  }
}));

const PublicProjectsListPage = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const restorationTrackerApi = useRestorationTrackerApi();
  const classes = useStyles();
  const history = useHistory();

  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<IGetProjectsListResponse[]>([]);

  useEffect(() => {
    const getProjects = async () => {
      const projectsResponse = await restorationTrackerApi.public.project.getProjectsList();

      setProjects(() => {
        setIsLoading(false);
        return projectsResponse;
      });
    };

    if (isLoading) {
      getProjects();
    }
  }, [restorationTrackerApi, isLoading]);

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (ProjectStatusType.ACTIVE === status_name) {
      chipLabel = 'ACTIVE';
      chipStatusClass = classes.chipActive;
    } else if (ProjectStatusType.COMPLETED === status_name) {
      chipLabel = 'COMPLETED';
      chipStatusClass = classes.chipCompleted;
    }

    return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };

  const navigateToPublicProjectPage = (id: number) => {
    history.push(`/projects/${id}`);
  };

  const getProjectsTableData = () => {
    const hasProjects = projects?.length > 0;

    if (!hasProjects) {
      return (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Permits</TableCell>
              <TableCell>Contact Agency</TableCell>
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
      );
    } else {
      return (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Permits</TableCell>
                <TableCell>Contact Agency</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Completion Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="project-table">
              {projects?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    <Link
                      data-testid={row.name}
                      underline="always"
                      component="button"
                      variant="body2"
                      onClick={() => navigateToPublicProjectPage(row.id)}>
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.project_type}</TableCell>
                  <TableCell>{row.permits_list}</TableCell>
                  <TableCell>{row.coordinator_agency}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.start_date)}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.end_date)}</TableCell>
                  <TableCell>{getChipIcon(row.completion_status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
  };

  if (keycloakWrapper?.keycloak?.authenticated) {
    // User has a role
    return <Redirect to={{ pathname: '/admin/projects' }} />;
  }

  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5}>
          <Typography variant="h1">Projects</Typography>
        </Box>
        <Paper>{getProjectsTableData()}</Paper>
      </Container>
    </Box>
  );
};

export default PublicProjectsListPage;
