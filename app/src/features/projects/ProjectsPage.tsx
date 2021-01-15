import {
  Box,
  Button,
  Container,
  //IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@material-ui/core';
import {
  withStyles,
  Theme,
  createStyles
} from '@material-ui/core/styles';
//import { Edit} from '@material-ui/icons';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProject } from 'interfaces/project-interfaces';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

/**
 * Table styling
 * https://material-ui.com/components/tables/
 */
const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    title: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.common.black,
      fontWeight: 800
    },
    head: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.common.black,
      fontWeight: 600
    },
    body: {
    }
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }),
)(TableRow);

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

  // const navigateToEditProjectPage = (id: string | number) => {
  //   history.push(`/projects/${id}/edit`);
  // };

  const navigateToProjectPage = (id: string | number) => {
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
        <Box mb={3} fontSize={30} fontWeight="fontWeightBold"> 
        Projects<Button variant="outlined" size= "small" color="primary" style={{float: 'right', border: '2px solid', textTransform: 'capitalize', fontWeight: 'bold'}} onClick={navigateToCreateProjectPage}>
            Create Project
          </Button>
        </Box>
        <Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Project Name</StyledTableCell>
                  <StyledTableCell>Dates</StyledTableCell>
                  <StyledTableCell>Location</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((row) => (
                  <StyledTableRow key={row.id} onClick={() => navigateToProjectPage(row.id)}>
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell>{row.start_date} - {row.end_date}</TableCell>
                    <TableCell>{row.location_description}</TableCell>
                  </StyledTableRow>
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
