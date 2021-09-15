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
import React from 'react';
import { mdiFileExcelOutline } from '@mdi/js';
import Icon from '@mdi/react';


/**
 * Page to display a list of resources.
 *
 * @return {*}
 */
const ResourcesPage: React.FC = () => {
  const resources = [
    {
      id: '1',
      name: 'Moose SRB or Composition Survey Skeena',
      url: 'https://nrs.objectstore.gov.bc.ca/gblhvt/templates/Moose_SRB_or_Composition_Survey_Skeena.xlsx',
      type: mdiFileExcelOutline
    },
    {
      id: '2',
      name: 'Moose SRB or Composition Survey Omineca',
      url: 'https://nrs.objectstore.gov.bc.ca/gblhvt/templates/Moose_SRB_or_Composition_Survey_Omineca.xlsx',
      type: mdiFileExcelOutline
    },
    {
      id: '3',
      name: 'Moose SRB or Composition Survey Cariboo',
      url: 'https://nrs.objectstore.gov.bc.ca/gblhvt/templates/Moose_SRB_or_Composition_Survey_Cariboo.xlsx',
      type: mdiFileExcelOutline
    },
    {
      id: '4',
      name: 'Moose SRB or Composition Survey Okanagan',
      url: 'https://nrs.objectstore.gov.bc.ca/gblhvt/templates/Moose_SRB_or_Composition_Survey_Okanagan.xlsx',
      type: mdiFileExcelOutline
    },
    {
      id: '5',
      name: 'Moose SRB or Composition Survey Kootenay',
      url: 'https://nrs.objectstore.gov.bc.ca/gblhvt/templates/Moose_SRB_or_Composition_Survey_Kootenay.xlsx',
      type: mdiFileExcelOutline
    },
    {
      id: '6',
      name: 'Moose Recruitment Survey',
      url:
        'https://nrs.objectstore.gov.bc.ca/gblhvt/templates/Moose_Recruitment_Survey.xlsx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nr-biohubbc-dlv%2F20210914%2Fca-central-1%2Fs3%2Faws4_request&X-Amz-Date=20210914T212011Z&X-Amz-Expires=300000&X-Amz-Signature=6645f28fe7f569f3d473090d07d735a32219556a1a3b79a6d466d017a7b8a157&X-Amz-SignedHeaders=host',
      type: mdiFileExcelOutline
    }
  ];


  const getResourcesList = () => {

      return (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="resources-table">
              {resources?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link underline="always" component="button" variant="body2">
                      <a href={row.url}>{row.name}</a>
                    </Link>
                  </TableCell>
                  <TableCell> <Icon path={row.type} size={1} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    };
  //};

  /**
   * Displays resources list.
   */
  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" justifyContent="space-between">
          <Typography variant="h1">Resources</Typography>
        </Box>
        <Paper>
          <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
          </Box>
          <Divider></Divider>
          {getResourcesList()}
        </Paper>
      </Container>
    </Box>
  );
};

export default ResourcesPage;
