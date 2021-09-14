import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React from 'react';

/**
 * Page to display a list of resources.
 *
 * @return {*}
 */
const ResourcesPage: React.FC = () => {
  const biohubApi = useBiohubApi();

  const resources = [
    {
      id: '1',
      name: 'Moose SRB or Composition Survey Skeena',
      url: 'https://nrs.objectstore.gov.bc.ca/gblhvt/templates/Moose_SRB_or_Composition_Survey_Skeena.xlsx',
      description: 'some lorem ipsum'
    },
    {
      id: '2',
      name: 'Moose SRB or Composition Survey Omineca',
      url: 'https://nrs.objectstore.gov.bc.ca/gblhvt/templates/Moose_SRB_or_Composition_Survey_Omineca.xlsx',
      description: 'some lorem ipsum'
    },
    {
      id: '3',
      name: 'Moose SRB or Composition Survey Cariboo',
      url: 'https://nrs.objectstore.gov.bc.ca/gblhvt/templates/Moose_SRB_or_Composition_Survey_Cariboo.xlsx',
      description: 'some lorem ipsum'
    },
    {
      id: '4',
      name: 'Moose SRB or Composition Survey Okanagan',
      url: 'https://nrs.objectstore.gov.bc.ca/gblhvt/templates/Moose_SRB_or_Composition_Survey_Okanagan.xlsx',
      description: 'some lorem ipsum'
    },
    {
      id: '5',
      name: 'Moose SRB or Composition Survey Kootenay',
      url: 'https://nrs.objectstore.gov.bc.ca/gblhvt/templates/Moose_SRB_or_Composition_Survey_Koot.xlsx',
      description: 'some lorem ipsum'
    },
    {
      id: '6',
      name: 'Moose Recruitment Survey',
      webkitURL: 'https://nrs.objectstore.gov.bc.ca/gblhvt/templates/Moose_Recruitment_Survey.xlsx',
      description: 'some lorem ipsum'
    }
  ];

  const resourcesCount = resources.length;

  const viewFileContents = async (resource: any) => {
    try {
      const { data } = await biohubApi.external.get(resource.url);

      if (!data) {
        return;
      }

      window.open(data);
    } catch (error) {
      return error;
    }
  };

  const getResourcesList = () => {
    const hasResources = resources.length > 0;
    console.log(resources.length);

    if (!hasResources) {
      return (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Link</TableCell>
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
                <TableCell></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="resources-table">
              {resources?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row"></TableCell>
                  <TableCell>
                    <Link underline="always" component="button" variant="body2" onClick={() => viewFileContents(row)}>
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
  };

  /**
   * Displays permits list.
   */
  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" justifyContent="space-between">
          <Typography variant="h1">Resources</Typography>
        </Box>
        <Paper>
          <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
            <Typography variant="h4" component="h3">
              {resourcesCount} found
            </Typography>
          </Box>
          <Divider></Divider>
          {getResourcesList()}
        </Paper>
      </Container>
    </Box>
  );
};

export default ResourcesPage;
