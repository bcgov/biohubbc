import Box from '@material-ui/core/Box';
import Chip from '@material-ui/core/Chip';
import Link from '@material-ui/core/Link';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
// import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
// import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';
// import { getFormattedDateRangeString } from 'utils/Utils';
import { mdiAlertCircle } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
// import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SurveyStatusType } from 'constants/misc';
import { SurveyViewObject } from 'interfaces/useSurveyApi.interface';
import moment from 'moment';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  surveyTable: {
    tableLayout: 'fixed'
  }
}));

export interface ISurveysListProps {
  surveysList: SurveyViewObject[];
  projectId: number;
}

const SurveysList: React.FC<ISurveysListProps> = (props) => {
  const classes = useStyles();

  const [rowsPerPage] = useState(5);
  const [page] = useState(0);

  const getSurveyCompletionStatusType = (surveyObject: SurveyViewObject): SurveyStatusType => {
    if (
      surveyObject.survey_details.end_date &&
      moment(surveyObject.survey_details.end_date).endOf('day').isBefore(moment())
    ) {
      return SurveyStatusType.COMPLETED;
    }

    return SurveyStatusType.ACTIVE;
  };

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (SurveyStatusType.ACTIVE === status_name) {
      chipLabel = 'Active';
    } else if (SurveyStatusType.COMPLETED === status_name) {
      chipLabel = 'Completed';
    }

    return <Chip color="secondary" style={{ minWidth: '100px' }} className={clsx(chipStatusClass)} label={chipLabel} />;
  };

  return (
    <>
      <TableContainer>
        <Table aria-label="surveys-list-table" className={classes.surveyTable}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Species</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell width="220px">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.surveysList.length > 0 &&
              props.surveysList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow key={index}>
                  <TableCell scope="row">
                    <Link
                      style={{ fontWeight: 'bold' }}
                      underline="always"
                      href={`/admin/projects/${props.projectId}/surveys/${row.survey_details.id}/details`}>
                      {row.survey_details.survey_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {[...row.species?.focal_species_names, ...row.species?.ancillary_species_names].join(', ')}
                  </TableCell>
                  <TableCell>Community Composition</TableCell>
                  {/* <TableCell>
                    Call Playback
                  </TableCell> */}
                  {/* <TableCell>
                    {getFormattedDateRangeString(
                      DATE_FORMAT.ShortMediumDateFormat,
                      row.survey_details.start_date,
                      row.survey_details.end_date
                    )}
                  </TableCell> */}
                  <TableCell>
                    <Chip
                      size="small"
                      color="secondary"
                      label="Pending Review"
                      icon={<Icon path={mdiAlertCircle} size={0.8} />}
                    />

                    <Box hidden>{getChipIcon(getSurveyCompletionStatusType(row))}</Box>
                  </TableCell>
                </TableRow>
              ))}
            {!props.surveysList.length && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <strong>No Surveys</strong>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* {props.surveysList.length > 0 && (
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
      )} */}
    </>
  );
};

export default SurveysList;
