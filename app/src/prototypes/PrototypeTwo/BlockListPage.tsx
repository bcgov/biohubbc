import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
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
import React from 'react';
import { IBlockData, IPageState } from './PrototypeTypePage';

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

export interface IBlockListPageProps {
  pageState?: IPageState;
  setPageState?: any;
  goToNewBlockPage: () => void;
}

const BlockListPage: React.FC<IBlockListPageProps> = (props) => {
  const classes = useStyles();

  return (
    <>
      <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h2">Blocks</Typography>
        <Box>
          <Box display="flex" justifyContent="space-between">
            <Box mr={1}>
              <Button variant="outlined" color="primary">
                Export to CSV
              </Button>
            </Box>
            <Button variant="outlined" color="primary" onClick={() => props.goToNewBlockPage()}>
              Add Block
            </Button>
          </Box>
        </Box>
      </Box>
      <Box mb={3}>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="observation-list-table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.heading}>Block</TableCell>
                <TableCell className={classes.heading}>Block Size</TableCell>
                <TableCell className={classes.heading}>Strata</TableCell>
                <TableCell className={classes.heading}>Start Time</TableCell>
                <TableCell className={classes.heading}>End Time</TableCell>
                <TableCell className={classes.heading}># Observations</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props?.pageState?.blockData?.map((item: IBlockData, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {item.blockName}
                  </TableCell>
                  <TableCell>{item.blockSize}</TableCell>
                  <TableCell>{item.strata}</TableCell>
                  <TableCell>{item.start_time}</TableCell>
                  <TableCell>{item.end_time}</TableCell>
                  <TableCell>{item.numObservations}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
};

export default BlockListPage;
