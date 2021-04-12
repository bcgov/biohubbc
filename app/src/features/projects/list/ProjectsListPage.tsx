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
  TableRow,
  Typography
} from '@material-ui/core';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectsListResponse } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { DATE_FORMAT } from 'constants/dateFormats';
import { getFormattedDate } from 'utils/Utils';

/**
 * Page to display a list of projects.
 *
 * @return {*}
 */
const ProjectsListPage: React.FC = () => {
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const [projects, setProjects] = useState<IGetProjectsListResponse[]>([]);

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

    if (isLoading) {
      getProjects();
    }
  }, [biohubApi, isLoading]);

  /**
   * Displays project list.
   */

  let hasProjects = projects.length > 0;

  if (!hasProjects) {
    return (
      <Box my={4}>
        <Container maxWidth="xl">
          <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h1">Projects</Typography>
            <Button variant="outlined" color="primary" onClick={navigateToCreateProjectPage}>
              Create Project
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow></TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>No Projects found</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    );
  } else {
    return (
      <Box my={4}>
        <Container maxWidth="xl">
          <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h1">Projects</Typography>
            <Button variant="outlined" color="primary" onClick={navigateToCreateProjectPage}>
              Create Project
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Species</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody data-testid="project-table">
                {projects.map((row) => (
                  <TableRow data-testid={row.name} key={row.id} onClick={() => navigateToProjectPage(row.id)}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.focal_species_name_list}</TableCell>
                    <TableCell>{row.regions_name_list}</TableCell>
                    <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.start_date)}</TableCell>
                    <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.end_date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>
    );
  }
};

export default ProjectsListPage;
