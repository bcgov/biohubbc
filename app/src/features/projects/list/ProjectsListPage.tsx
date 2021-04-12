import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core';
import { withStyles, Theme, createStyles } from '@material-ui/core/styles';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectsListResponse } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { DATE_FORMAT } from 'constants/dateFormats';
import { getFormattedDate } from 'utils/Utils';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';

/**
 * Table styling
 * https://material-ui.com/components/tables/
 */
const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.common.black,
      fontWeight: 600
    },
    body: {}
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover
      }
    }
  })
)(TableRow);

/**
 * Creates a style for an empty list of projects.
 *
 */

const StyledTableCellEmpty = withStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.common.black,
      fontWeight: 400,
      textAlign: 'center'
    }
  })
)(TableCell);

/**
 * Page to display a list of projects.
 *
 * @return {*}
 */
const ProjectsListPage: React.FC = () => {
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const [projects, setProjects] = useState<IGetProjectsListResponse[]>([]);
  const [drafts, setDrafts] = useState<IGetDraftsListResponse[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const navigateToCreateProjectPage = () => {
    history.push('/projects/create');
  };

  const navigateToProjectPage = (id: number) => {
    history.push(`/projects/${id}`);
  };

  useEffect(() => {
    const getProjects = async () => {
      const projectsResponse = await biohubApi.project.getProjectsList();

      setProjects(() => {
        setIsLoading(false);
        return projectsResponse;
      });
    };

    const getDrafts = async () => {
      const draftsResponse = await biohubApi.draft.getDraftsList();

      setDrafts(() => {
        setIsLoading(false);
        return draftsResponse;
      });
    };

    if (isLoading) {
      getProjects();
      getDrafts();
    }
  }, [biohubApi, isLoading]);

  /**
   * Displays project list.
   */

  const hasProjects = projects.length > 0;
  const hasDrafts = drafts.length > 0;

  if (!hasProjects && !hasDrafts) {
    return (
      <Box my={3}>
        <Container>
          <Box mb={3} fontSize={30} fontWeight="fontWeightBold">
            Projects
            <Button
              variant="outlined"
              size="small"
              color="primary"
              style={{ float: 'right', border: '2px solid', textTransform: 'capitalize', fontWeight: 'bold' }}
              onClick={navigateToCreateProjectPage}>
              Create Project
            </Button>
          </Box>
          <Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow></TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <StyledTableCellEmpty>No Projects found</StyledTableCellEmpty>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Container>
      </Box>
    );
  } else {
    return (
      <Box my={3}>
        <Container>
          <Box mb={3} fontSize={30} fontWeight="fontWeightBold">
            Projects
            <Button
              variant="outlined"
              size="small"
              color="primary"
              style={{ float: 'right', border: '2px solid', textTransform: 'capitalize', fontWeight: 'bold' }}
              onClick={navigateToCreateProjectPage}>
              Create Project
            </Button>
          </Box>
          <Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <StyledTableCell>Project Name</StyledTableCell>
                    <StyledTableCell>Species</StyledTableCell>
                    <StyledTableCell>Location</StyledTableCell>
                    <StyledTableCell>Start Date</StyledTableCell>
                    <StyledTableCell>End Date</StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody data-testid="project-table">
                  {drafts.map((row) => (
                    <StyledTableRow data-testid={row.name} key={row.id}>
                      <TableCell>{row.name} (Draft)</TableCell>
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </StyledTableRow>
                  ))}
                  {projects.map((row) => (
                    <StyledTableRow data-testid={row.name} key={row.id} onClick={() => navigateToProjectPage(row.id)}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.focal_species_name_list}</TableCell>
                      <TableCell>{row.regions_name_list}</TableCell>
                      <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.start_date)}</TableCell>
                      <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.end_date)}</TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Container>
      </Box>
    );
  }
};

export default ProjectsListPage;
