import Link from '@material-ui/core/Link';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { SurveyViewObject } from 'interfaces/useSurveyApi.interface';
import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';

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

  return (
    <>
      <TableContainer>
        <Table aria-label="surveys-list-table" className={classes.surveyTable}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Species</TableCell>
              <TableCell>Purpose</TableCell>
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
                </TableRow>
              ))}
            {!props.surveysList.length && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography component="strong" color="textSecondary" variant="body2">No Surveys</Typography>
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
