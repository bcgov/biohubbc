import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { SurveyStatusType } from 'constants/misc';
import clsx from 'clsx';
import { IGetSurveysListResponse } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { getFormattedDateRangeString } from 'utils/Utils';
import { handleChangeRowsPerPage, handleChangePage } from 'utils/tablePaginationUtils';
import { useHistory } from 'react-router';

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
    backgroundColor: theme.palette.text.disabled
  },
  chipActive: {
    backgroundColor: theme.palette.warning.main
  },
  chipPublishedCompleted: {
    backgroundColor: theme.palette.success.main
  }
}));

export interface ISurveysListProps {
  surveysList: IGetSurveysListResponse[];
  projectId: number;
}

const SurveysList: React.FC<ISurveysListProps> = (props) => {
  const classes = useStyles();
  const history = useHistory();

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (SurveyStatusType.UNPUBLISHED === status_name) {
      chipLabel = 'UNPUBLISHED';
      chipStatusClass = classes.chipUnpublished;
    } else if (SurveyStatusType.PUBLISHED === status_name) {
      chipLabel = 'PUBLISHED';
      chipStatusClass = classes.chipPublishedCompleted;
    } else if (SurveyStatusType.ACTIVE === status_name) {
      chipLabel = 'ACTIVE';
      chipStatusClass = classes.chipActive;
    } else if (SurveyStatusType.COMPLETED === status_name) {
      chipLabel = 'COMPLETED';
      chipStatusClass = classes.chipPublishedCompleted;
    }

    return <Chip className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };

  return (
    <Paper>
      <TableContainer>
        <Table className={classes.table} aria-label="surveys-list-table">
          <TableHead>
            <TableRow>
              <TableCell className={classes.heading}>Name</TableCell>
              <TableCell className={classes.heading}>Species</TableCell>
              <TableCell className={classes.heading}>Timeline</TableCell>
              <TableCell>Completion Status</TableCell>
              <TableCell>Publish Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.surveysList.length > 0 &&
              props.surveysList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    <Link
                      underline="always"
                      component="button"
                      variant="body2"
                      onClick={() => history.push(`/projects/${props.projectId}/surveys/${row.id}/details`)}>
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.species?.join(', ')}</TableCell>
                  <TableCell>
                    {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat2, row.start_date, row.end_date)}
                  </TableCell>
                  <TableCell>{getChipIcon(row.completion_status)}</TableCell>
                  <TableCell>{getChipIcon(row.publish_status)}</TableCell>
                </TableRow>
              ))}
            {!props.surveysList.length && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No Surveys
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {props.surveysList.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 15, 20]}
          component="div"
          count={props.surveysList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={(event: unknown, newPage: number) => handleChangePage(event, newPage, setPage)}
          onChangeRowsPerPage={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleChangeRowsPerPage(event, setPage, setRowsPerPage)
          }
        />
      )}
    </Paper>
  );
};

export default SurveysList;
