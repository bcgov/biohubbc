import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
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
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  projectTitleContainer: {
    maxWidth: '170ch',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  projectTitle: {
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    overflow: 'hidden'
  },
  toolbarCount: {
    fontWeight: 400
  }
}));

/**
 * Page to search for and display a list of records spatially.
 *
 * @return {*}
 */
const AdminDashboard: React.FC = () => {
  const classes = useStyles();

  return (
    <>
      <Paper square={true} elevation={0}>
        <Container maxWidth="xl">
          <Box py={4}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box className={classes.projectTitleContainer}>
                <Typography variant="h1" className={classes.projectTitle}>
                  Welcome, <span>John Smith</span>
                </Typography>
                <Box mt={0.75} mb={0.5} display="flex" alignItems="center">
                  <Typography
                    component="span"
                    variant="subtitle1"
                    color="textSecondary"
                    style={{ display: 'flex', alignItems: 'center' }}>
                    You have&nbsp;<strong>11 documents</strong>&nbsp;to review
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Paper>
      <Container maxWidth="xl">
        <Box py={3}>
          <Paper elevation={0}>
            <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h4" component="h2">
                Security Reviews{' '}
                <Typography className={classes.toolbarCount} component="span" variant="inherit" color="textSecondary">
                  (2)
                </Typography>
              </Typography>
            </Toolbar>
            <Divider></Divider>
            <Box px={1}>
              <TableContainer>
                <Table style={{ tableLayout: 'fixed' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Project Name</TableCell>
                      <TableCell>Last Modified</TableCell>
                      <TableCell width={300}>Files to Review</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Link href="#" underline="always" style={{ fontWeight: 700 }}>
                          Species Inventory Project Name
                        </Link>
                      </TableCell>
                      <TableCell>YYYY-MM-DD</TableCell>
                      <TableCell>5</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Link href="#" underline="always" style={{ fontWeight: 700 }}>
                          Species Inventory Project Name
                        </Link>
                      </TableCell>
                      <TableCell>YYYY-MM-DD</TableCell>
                      <TableCell>6</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default AdminDashboard;
