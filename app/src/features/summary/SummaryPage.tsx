import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import PageHeader from 'components/layout/PageHeader';
import { SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { ListDataTableContainer } from 'features/summary/list-data/ListDataTableContainer';
import { TabularDataTableContainer } from 'features/summary/tabular-data/TabularDataTableContainer';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Page to display a summary of all a user's data.
 *
 * @return {*}
 */
const SummaryPage = () => {
  return (
    <>
      <PageHeader
        title="Dashboard"
        buttonJSX={
          <SystemRoleGuard
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiPlus} size={1} />}
              component={RouterLink}
              to={'/admin/projects/create'}>
              Create Project
            </Button>
          </SystemRoleGuard>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper>
          <ListDataTableContainer />
        </Paper>
        <Paper sx={{ mt: 3 }}>
          <TabularDataTableContainer />
        </Paper>
      </Container>
    </>
  );
};

export default SummaryPage;
