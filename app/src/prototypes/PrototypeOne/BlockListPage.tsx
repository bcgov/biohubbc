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

/**
 * Get surveys list response object.
 *
 * @export
 * @interface IGetBlockListResponse
 */
export interface IGetBlockListResponse {
  id: number;
  name: string;
  species: string[];
  start_date: string;
  end_date: string;
  status_name: string;
}

const BlockListPage: React.FC = () => {
  //const [blockList, setBlockList] = useState<IGetBlockListResponse[]>([]);

  const classes = useStyles();
  const history = useHistory();

  const navigateToCreateObservation1Page = () => {
    let path1 = `newPath`;
    history.push(path1);
  };
  const navigateToCreateObservation2Page = () => {
    let path2 = `newPath`;
    history.push(path2);
  };

  return (
    <Box mb={6} my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h2">Animals Observed</Typography>
          <Box display="flex" justifyContent="space-between">
            <Box mr={1}>
              <Button variant="outlined" color="primary" onClick={() => navigateToCreateObservation1Page()}>
                Create Observation v1
              </Button>
            </Box>

            <Button variant="outlined" color="primary" onClick={() => navigateToCreateObservation2Page()}>
              Create Observation v2
            </Button>
          </Box>
        </Box>
        <Box mb={3}>
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="observation-list-table">
              <TableHead>
                <TableRow>
                  <TableCell className={classes.heading}>Group</TableCell>
                  <TableCell className={classes.heading}>Waypoint</TableCell>
                  <TableCell className={classes.heading}>Species</TableCell>
                  <TableCell className={classes.heading}>Demographic</TableCell>
                  <TableCell className={classes.heading}>Count</TableCell>
                  <TableCell className={classes.heading}>Activity</TableCell>
                  <TableCell className={classes.heading}>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">
                    {'1'}
                  </TableCell>
                  <TableCell>{'103'}</TableCell>
                  <TableCell>{'Grizzlybear Prickly Pear - x columbiana'}</TableCell>
                  <TableCell>{'Dense'}</TableCell>
                  <TableCell>{'30'}</TableCell>
                  <TableCell>{'Bedding'}</TableCell>
                  <TableCell>{'3 pm'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </Box>
  );
};

export default BlockListPage;
