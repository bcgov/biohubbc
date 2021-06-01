import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { useHistory } from 'react-router';
import TableBody from '@material-ui/core/TableBody';

const useStyles = makeStyles((theme: Theme) => ({
  table: {
    minWidth: 650
  },
  heading: {
    fontWeight: 'bold'
  },
  tableCellBorderTop: {
    borderTop: '1px solid rgba(224, 224, 224, 1)'
  },
  chip: {
    padding: '0px 8px',
    borderRadius: '4px',
    color: 'white'
  },
  chipUnpublished: {
    backgroundColor: theme.palette.text.secondary
  },
  chipPublished: {
    backgroundColor: theme.palette.success.light
  }
}));

const BlockListPage: React.FC = () => {
  const classes = useStyles();
  const history = useHistory();

  // const navigateToCreateObservationPage_v1 = () => {
  //   history.push('/projects/1/surveys/1/prototype/1');
  // };

  const navigateToCreateObservationPage_v2 = () => {
    history.push('/projects/1/surveys/1/prototype');
  };

  return (
    <Container maxWidth="xl">
      <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h2">Blocks</Typography>
        <Box display="flex" justifyContent="space-between">
          {/* <Box mr={1}>
              <Button variant="outlined" color="primary" onClick={() => navigateToCreateObservationPage_v1()}>
                Add Block v1
              </Button>
            </Box> */}

          <Button variant="outlined" color="primary" onClick={() => navigateToCreateObservationPage_v2()}>
            Add Block
          </Button>
        </Box>
      </Box>
      <Box mb={3}>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="observation-list-table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.heading}>Block</TableCell>
                <TableCell className={classes.heading}># Observations</TableCell>
                <TableCell className={classes.heading}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  {'1'}
                </TableCell>
                <TableCell>{'5'}</TableCell>
                <TableCell>{'2021-05-15'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  {'2'}
                </TableCell>
                <TableCell>{'3'}</TableCell>
                <TableCell>{'2021-05-16'}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default BlockListPage;
