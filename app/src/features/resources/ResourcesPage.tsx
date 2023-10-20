import { mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IResourceFile } from 'interfaces/useResourcesApi.interface';
import React from 'react';
import { ensureProtocol } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  pageTitleContainer: {
    maxWidth: '170ch',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  pageTitle: {
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    overflow: 'hidden'
  }
}));

/**
 * Page to display a list of resources
 *
 * @return {*}
 */
const ResourcesPage: React.FC = () => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();
  const resourcesDataLoader = useDataLoader(() => biohubApi.resources.listResources());

  resourcesDataLoader.load();

  const resources: IResourceFile[] = resourcesDataLoader.data?.files || [];

  if (!resourcesDataLoader.isReady || resourcesDataLoader.isLoading) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const getResourcesList = () => {
    return (
      <TableContainer>
        <Table style={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell width={150} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody data-testid="resources-table">
            {resources.length === 0 ? (
              <TableRow data-testid={'resources-row-0'}>
                <TableCell colSpan={3} style={{ textAlign: 'center' }}>
                  No Resources Available
                </TableCell>
              </TableRow>
            ) : (
              resources.map((row: IResourceFile) => {
                const { templateType } = row.metadata;
                const templateName = row.metadata.templateName || row.fileName;
                const downloadUrl = ensureProtocol(row.url, 'https://');

                return (
                  <TableRow key={row.url}>
                    <TableCell>
                      <Link href={downloadUrl} underline="always" style={{ fontWeight: 700 }}>
                        {templateName}
                      </Link>
                    </TableCell>
                    <TableCell>{templateType || 'Other'}</TableCell>
                    <TableCell align="center">
                      <IconButton href={downloadUrl} aria-label={`Download ${templateName}`}>
                        <Icon path={mdiTrayArrowDown} size={0.8} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  /**
   * Displays resources list.
   */
  return (
    <>
      <Paper square={true} elevation={0}>
        <Container maxWidth="xl">
          <Box py={4}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box className={classes.pageTitleContainer}>
                <Typography variant="h1" className={classes.pageTitle}>
                  Resources
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Paper>
      <Container maxWidth="xl">
        <Box py={3}>
          <Paper elevation={0}>
            <Box px={1}>{getResourcesList()}</Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default ResourcesPage;
