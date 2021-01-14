import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core';
import { Add, Edit } from '@material-ui/icons';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProject } from 'interfaces/project-interfaces';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

/**
 * Page to display a list of projects.
 *
 * @return {*}
 */
const ProjectsPage: React.FC = () => {
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const [projects, setProjects] = useState<IProject[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const navigateToCreateProjectPage = () => {
    history.push('/projects/create');
  };

  const navigateToEditProjectPage = (id: number) => {
    history.push(`/projects/${id}/edit`);
  };

  const navigateToProjectPage = (id: number) => {
    history.push(`/projects/${id}`);
  };

  useEffect(() => {
    const getProjects = async () => {
      const projectsResponse = await biohubApi.getProjects();

      setProjects(() => {
        setIsLoading(false);

        return projectsResponse;
      });
    };

    if (isLoading) {
      getProjects();
    }
  }, [biohubApi, isLoading]);

  return (
    <Box my={3}>
      <Container>
        <Box mb={3}>
          <Button variant="contained" color="primary" startIcon={<Add />} onClick={navigateToCreateProjectPage}>
            Create Project
          </Button>
        </Box>
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Location Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((row) => (
                  <TableRow key={row.id} onClick={() => navigateToProjectPage(row.id)}>
                    <TableCell component="th" scope="row">
                      {row.id}
                    </TableCell>
                    <TableCell>{row.start_date}</TableCell>
                    <TableCell>{row.end_date}</TableCell>
                    <TableCell>{row.location_description}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(event) => {
                          event.stopPropagation();
                          navigateToEditProjectPage(row.id);
                        }}>
                        <Edit color="primary" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </Box>
  );
};

export default ProjectsPage;
