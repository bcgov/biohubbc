import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
import { BioHubSubmittedStatusType } from 'constants/misc';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetSurveyForListResponse } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles(() => ({
  surveyTable: {
    tableLayout: 'fixed'
  }
}));

export interface ISurveysListProps {
  surveysList: IGetSurveyForListResponse[];
  projectId: number;
  codes: IGetAllCodeSetsResponse;
}

const SurveysList: React.FC<ISurveysListProps> = (props) => {
  const classes = useStyles();

  const [rowsPerPage] = useState(5);
  const [page] = useState(0);

  function getSurveySubmissionStatus(survey: IGetSurveyForListResponse): BioHubSubmittedStatusType {
    if (survey.surveySupplementaryData.has_unpublished_content) {
      return BioHubSubmittedStatusType.UNSUBMITTED;
    }
    return BioHubSubmittedStatusType.SUBMITTED;
  }

  return (
    <>
      <TableContainer>
        <Table aria-label="surveys-list-table" className={classes.surveyTable}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Species</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell width="140">Status</TableCell>
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
                      to={`/admin/projects/${props.projectId}/surveys/${row.surveyData.survey_details.id}/details`}
                      component={RouterLink}>
                      {row.surveyData.survey_details.survey_name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {[
                      ...row.surveyData.species.focal_species_names,
                      ...row.surveyData.species.ancillary_species_names
                    ].join(', ')}
                  </TableCell>
                  <TableCell>
                    {row.surveyData.purpose_and_methodology.intended_outcome_id &&
                      props.codes?.intended_outcomes?.find(
                        (item: any) => item.id === row.surveyData.purpose_and_methodology.intended_outcome_id
                      )?.name}
                  </TableCell>
                  <TableCell>
                    <SubmitStatusChip status={getSurveySubmissionStatus(row)} />
                  </TableCell>
                </TableRow>
              ))}
            {!props.surveysList.length && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography component="strong" color="textSecondary" variant="body2">
                    No Surveys
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default SurveysList;
