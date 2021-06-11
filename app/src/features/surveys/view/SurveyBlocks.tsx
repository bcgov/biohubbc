import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useState, useEffect } from 'react';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { handleChangeRowsPerPage, handleChangePage } from 'utils/tablePaginationUtils';
import TablePagination from '@material-ui/core/TablePagination';
import { IGetBlocksListResponse } from 'interfaces/useBlockObservationApi.interface';

const useStyles = makeStyles(() => ({
  table: {
    minWidth: 650
  },
  heading: {
    fontWeight: 'bold'
  }
}));

export interface ISurveyBlocksProps {
  projectForViewData: IGetProjectForViewResponse;
  surveyForViewData: IGetSurveyForViewResponse;
}

const SurveyBlocks: React.FC<ISurveyBlocksProps> = (props) => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const { projectForViewData, surveyForViewData } = props;

  const [blocks, setBlocks] = useState<IGetBlocksListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const getBlocks = async () => {
      // const blocksResponse = await biohubApi.block_observation.getBlocksList(projectForViewData.id, surveyForViewData.survey_details.id);

      // setBlocks(() => {
      //   setIsLoading(false);
      //   return blocksResponse;
      // });

      const response = [
        {
          id: 1,
          block_id: 24,
          number_of_observations: 3,
          start_time: '3:00PM',
          end_time: '4:00PM'
        },
        {
          id: 2,
          block_id: 25,
          number_of_observations: 31,
          start_time: '3:40PM',
          end_time: '4:40PM'
        }
      ];

      setIsLoading(false);
      setBlocks(response);
    };

    if (isLoading) {
      getBlocks();
    }
  }, [biohubApi, isLoading, projectForViewData.id, surveyForViewData.survey_details.id]);

  return (
    <>
      <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h2">Blocks & Observations</Typography>
        <Box>
          <Box display="flex" justifyContent="space-between">
            <Box mr={1}>
              <Button variant="contained" color="primary" onClick={() => console.log('new block survey')}>
                New Block Survey
              </Button>
            </Box>
            <Button variant="contained" color="primary">
              Add Incidental
            </Button>
          </Box>
        </Box>
      </Box>
      <Paper>
        <TableContainer>
          <Table className={classes.table} aria-label="block-list-table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.heading}>ID</TableCell>
                <TableCell className={classes.heading}>Location</TableCell>
                <TableCell className={classes.heading}>Observations</TableCell>
                <TableCell className={classes.heading}>Start Time</TableCell>
                <TableCell className={classes.heading}>End Time</TableCell>
                <TableCell className={classes.heading}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {blocks.length > 0 &&
                blocks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      {row.id}
                    </TableCell>
                    <TableCell className={classes.heading}>Block {row.block_id}</TableCell>
                    <TableCell>
                      {row.number_of_observations > 0 ? row.number_of_observations : `No Observations`}
                    </TableCell>
                    <TableCell>{row.start_time}</TableCell>
                    <TableCell>{row.end_time}</TableCell>
                    <TableCell>
                      <Link
                        underline="always"
                        component="button"
                        variant="body2"
                        onClick={() => console.log('edit block details')}>
                        Edit
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              {!blocks.length && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No Blocks/Observations
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {blocks.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 15, 20]}
            component="div"
            count={blocks.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={(event: unknown, newPage: number) => handleChangePage(event, newPage, setPage)}
            onChangeRowsPerPage={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChangeRowsPerPage(event, setPage, setRowsPerPage)
            }
          />
        )}
      </Paper>
    </>
  );
};

export default SurveyBlocks;
