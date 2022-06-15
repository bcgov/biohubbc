import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { mdiFileExcelOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { ConfigContext } from 'contexts/configContext';
import React, { useContext } from 'react';

/**
 * Page to display a list of resources.
 *
 * @return {*}
 */
const ResourcesPage: React.FC = () => {
  const config = useContext(ConfigContext);
  const s3PublicHostURL = config?.S3_PUBLIC_HOST_URL

  const resources = [
    {
      id: '1',
      name: 'Moose Aerial StratifiedRandomBlock Composition Survey 2.5',
      url:
        `${s3PublicHostURL}/templates/Moose_Aerial_StratifiedRandomBlock_Composition_Recruitment_Survey_2.5.xlsx`,
      type: mdiFileExcelOutline,
      lastModified: 'Today',
      fileSize: '115 KB'
    },
    {
      id: '2',
      name: 'Moose Recruitment Using Telemetry Survey 1.0',
      url: `${s3PublicHostURL}/templates/Moose_Recruitment_Using_Telemetry_Survey_1.0.xlsx`,
      type: mdiFileExcelOutline,
      lastModified: 'Today',
      fileSize: '93 KB'
    },
    {
      id: '3',
      name: 'Goat Aerial Population Composition Recruitment Survey 1.4',
      url:
        `${s3PublicHostURL}/templates/Goat_Aerial_Population_Composition_Recruitment_Survey_1.4.xlsx`,
      type: mdiFileExcelOutline,
      lastModified: 'Today',
      fileSize: '165 KB'
    },
    {
      id: '4',
      name: 'Sheep Aerial Population Composition Recruitment Survey 1.2',
      url:
        `${s3PublicHostURL}/templates/Sheep_Aerial_Population_Composition_Recruitment_Survey_1.2.xlsx`,
      type: mdiFileExcelOutline,
      lastModified: 'Today',
      fileSize: '109 KB'
    },
    {
      id: '5',
      name: 'Moose Summary Statistics',
      url: `${s3PublicHostURL}/templates/Moose_Summary_Statistics.xlsx`,
      type: mdiFileExcelOutline,
      lastModified: 'Today',
      fileSize: '10 KB'
    }
  ];

  const getResourcesList = () => {
    return (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Last Modified</TableCell>
              <TableCell>File Size</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody data-testid="resources-table">
            {resources?.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <Link href={row.url} underline="always">
                    {row.name}
                  </Link>
                </TableCell>

                <TableCell>{row.lastModified}</TableCell>
                <TableCell>{row.fileSize}</TableCell>
                <TableCell>
                  {' '}
                  <Icon path={row.type} size={1} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  /**
   * Displays resources list.
   */
  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" justifyContent="space-between">
          <Typography variant="h1">Resources</Typography>
        </Box>
        <Paper>{getResourcesList()}</Paper>
      </Container>
    </Box>
  );
};

export default ResourcesPage;
