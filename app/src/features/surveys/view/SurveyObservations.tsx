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
import { IGetBlocksListResponse } from 'interfaces/useObservationApi.interface';
import { useHistory } from 'react-router';
import { TIME_FORMAT } from 'constants/dateTimeFormats';
import { getFormattedTime } from 'utils/Utils';

const useStyles = makeStyles(() => ({
  table: {
    minWidth: 650
  },
  heading: {
    fontWeight: 'bold'
  }
}));

export interface ISurveyObservationsProps {
  projectForViewData: IGetProjectForViewResponse;
  surveyForViewData: IGetSurveyForViewResponse;
}

const SurveyObservations: React.FC<ISurveyObservationsProps> = (props) => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();
  const history = useHistory();

  const { projectForViewData, surveyForViewData } = props;

  const [surveyType, setSurveyType] = useState<string>('');
  const [observations, setObservations] = useState<IGetBlocksListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const getObservations = async () => {
      const observationsResponse = await biohubApi.observation.getObservationsList(
        projectForViewData.id,
        surveyForViewData.survey_details.id
      );

      if (!observationsResponse || !observationsResponse.blocks) {
        return;
      }

      if (observationsResponse.blocks) {
        setSurveyType('Block');
      }

      setIsLoading(false);
      setObservations(observationsResponse.blocks);
    };

    if (isLoading) {
      getObservations();
    }
  }, [biohubApi, isLoading, projectForViewData.id, surveyForViewData.survey_details.id]);

  const addNewObservation = () => {
    if (surveyType === 'Block') {
      history.push(
        `/projects/${projectForViewData.id}/surveys/${surveyForViewData.survey_details.id}/observations/create`
      );
    }
  };

  const addNewTemplateObservation = () => {
    history.push(
      `/projects/${projectForViewData.id}/surveys/${surveyForViewData.survey_details.id}/observations/template`
    );
  };

  const editObservation = async (observationId: number) => {
    if (surveyType === 'Block') {
      history.push(
        `/projects/${projectForViewData.id}/surveys/${surveyForViewData.survey_details.id}/observations/${observationId}/block`
      );
    }
  };

  return (
    <>
      <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h2" data-testid="observations-heading">
          Observations
        </Typography>
        <Box>
          <Box display="flex" justifyContent="space-between">
            <Box mr={1}>
              <Button variant="contained" color="primary" onClick={addNewObservation}>
                {`New ${surveyType} Survey`}
              </Button>
            </Box>
            <Box mr={1}>
              <Button variant="contained" color="primary" onClick={addNewTemplateObservation}>
                New Template Survey
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
              {observations.length > 0 &&
                observations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      {row.id}
                    </TableCell>
                    <TableCell className={classes.heading}>
                      {surveyType} {surveyType === 'Block' && row.block_id}
                    </TableCell>
                    <TableCell>
                      {row.number_of_observations > 0 ? row.number_of_observations : `No Observations`}
                    </TableCell>
                    <TableCell>{getFormattedTime(TIME_FORMAT.ShortTimeFormatAmPm, row.start_time)}</TableCell>
                    <TableCell>{getFormattedTime(TIME_FORMAT.ShortTimeFormatAmPm, row.end_time)}</TableCell>
                    <TableCell>
                      <Link
                        underline="always"
                        component="button"
                        variant="body2"
                        onClick={() => editObservation(row.id)}>
                        Edit
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              {!observations.length && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No Observations
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {observations.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 15, 20]}
            component="div"
            count={observations.length}
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

export default SurveyObservations;
