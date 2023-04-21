import Link from '@material-ui/core/Link';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import assert from 'assert';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
import { BioHubSubmittedStatusType } from 'constants/misc';
import { CodesContext } from 'contexts/codesContext';
import { ProjectContext } from 'contexts/projectContext';
import { IGetSurveyForListResponse } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

const useStyles = makeStyles(() => ({
  surveyTable: {
    tableLayout: 'fixed'
  }
}));

const SurveysList: React.FC = () => {
  const classes = useStyles();

  const codesContext = useContext(CodesContext);
  const projectContext = useContext(ProjectContext);

  const surveys = projectContext.surveysListDataLoader.data || [];
  const codes = codesContext.codesDataLoader.data;

  assert(projectContext.surveysListDataLoader.data);
  assert(codesContext.codesDataLoader.data);

  const [rowsPerPage] = useState(30);
  const [page] = useState(0);

  function getSurveySubmissionStatus(survey: IGetSurveyForListResponse): BioHubSubmittedStatusType {
    if (survey.surveySupplementaryData.has_unpublished_content) {
      return BioHubSubmittedStatusType.UNSUBMITTED;
    }
    return BioHubSubmittedStatusType.SUBMITTED;
  }
  console.log(`Testing:: Got Surveys: ${surveys.length}`);
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
            {surveys.length > 0 &&
              surveys.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                <TableRow key={index}>
                  <TableCell scope="row">
                    <Link
                      style={{ fontWeight: 'bold' }}
                      underline="always"
                      to={`/admin/projects/${projectContext.projectId}/surveys/${row.surveyData.survey_details.id}/details`}
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
                      codes?.intended_outcomes?.find(
                        (item: any) => item.id === row.surveyData.purpose_and_methodology.intended_outcome_id
                      )?.name}
                  </TableCell>
                  <TableCell>
                    <SubmitStatusChip status={getSurveySubmissionStatus(row)} />
                  </TableCell>
                </TableRow>
              ))}
            {!surveys.length && (
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
