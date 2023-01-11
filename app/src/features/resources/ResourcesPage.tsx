import { CircularProgress } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
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
            {resources.map((row: IResourceFile) => {
              const { templateType } = row.metadata
              const templateName = row.metadata.templateName || row.fileName;

              return (
                <TableRow key={row.url}>
                  <TableCell>
                    <Link href={ensureProtocol(row.url, 'https://')} underline="always" style={{ fontWeight: 700 }} >
                      {templateName}
                    </Link>
                  </TableCell>
                  <TableCell>{templateType || 'Other'}</TableCell>
                  <TableCell align="center">
                    <IconButton href={row.url} aria-label={`Download ${templateName}`}>
                      <Icon path={mdiTrayArrowDown} size={0.8} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )})}
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
