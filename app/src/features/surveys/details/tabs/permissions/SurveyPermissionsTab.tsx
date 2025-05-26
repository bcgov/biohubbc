import Paper from '@mui/material/Paper';
import SurveyMembersContainer from './members/SurveyMembersContainer';

/**
 * Displays data and contents of a specific survey, as a tab on the survey page
 *
 * @returns {*}
 */
export const SurveyPermissionsTab = () => {
  return (
    <Paper sx={{ gap: 2, height: '100%' }}>
      <SurveyMembersContainer />
    </Paper>
  );
};
