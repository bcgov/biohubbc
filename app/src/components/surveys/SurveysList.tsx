import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import assert from 'assert';
import { SubmitStatusChip } from 'components/chips/SubmitStatusChip';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { ProjectContext } from 'contexts/projectContext';
import React, { useContext, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

//TODO: PRODUCTION_BANDAGE: Remove <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>

const SurveysList: React.FC = () => {
  const projectContext = useContext(ProjectContext);

  const surveys = projectContext.surveysListDataLoader.data || [];

  assert(projectContext.surveysListDataLoader.data);

  const [rowsPerPage] = useState(30);
  const [page] = useState(0);

  if (!surveys.length) {
    return <NoSurveys />;
  }

  return (
    <>
      <TableContainer>
        <Table
          aria-label="surveys-list-table"
          sx={{
            tableLayout: 'fixed',
            '& td': {
              verticalAlign: 'top'
            }
          }}>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Focal Species</TableCell>
              <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
                <TableCell width="200">Status</TableCell>
              </SystemRoleGuard>
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
                      to={`/admin/projects/${projectContext.projectId}/surveys/${row.surveyData.survey_id}/details`}
                      component={RouterLink}>
                      {row.surveyData.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.surveyData.focal_species_names.join('; ')}</TableCell>
                  <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
                    <TableCell>
                      <SubmitStatusChip status={row.surveySupplementaryData.publishStatus} />
                    </TableCell>
                  </SystemRoleGuard>
                </TableRow>
              ))}
            {!surveys.length && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography component="strong" color="textSecondary" variant="body2">
                    No Surveys
                  </Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

function NoSurveys() {
  return (
    <Box display="flex" flex="1 1 auto" alignItems="center" justifyContent="center" p={2} minHeight={66}>
      <Typography component="span" variant="body2" color="textSecondary" data-testid="observations-nodata">
        No Surveys
      </Typography>
    </Box>
  );
}

export default SurveysList;
