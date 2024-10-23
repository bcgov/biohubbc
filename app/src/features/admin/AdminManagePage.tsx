import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import PageHeader from 'components/layout/PageHeader';
import { AdministrativeActivityStatusType, AdministrativeActivityType } from 'constants/misc';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import AlertContainer from './alert/AlertContainer';
import AccessRequestContainer from './users/access-requests/AccessRequestContainer';
import ActiveUsersList from './users/active/ActiveUsersList';

/**
 * Page to display admin management data/functionality for users, alerts, etc.
 *
 * @return {*}
 */
const AdminManagePage = () => {
  const biohubApi = useBiohubApi();

  // ACCESS REQUESTS
  const accessRequestsDataLoader = useDataLoader(() =>
    biohubApi.admin.getAdministrativeActivities(
      [AdministrativeActivityType.SYSTEM_ACCESS],
      [
        AdministrativeActivityStatusType.PENDING,
        AdministrativeActivityStatusType.REJECTED,
        AdministrativeActivityStatusType.ACTIONED
      ]
    )
  );

  useEffect(() => {
    accessRequestsDataLoader.load();
  }, []);

  // ACTIVE USERS
  const activeUsersDataLoader = useDataLoader(() => biohubApi.user.getUsersList());
  useEffect(() => {
    activeUsersDataLoader.load();
  }, []);

  const refreshAccessRequests = () => {
    accessRequestsDataLoader.refresh();
    activeUsersDataLoader.refresh();
  };

  const refreshActiveUsers = () => {
    activeUsersDataLoader.refresh();
  };

  return (
    <>
      <PageHeader title="Admin" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <AccessRequestContainer accessRequests={accessRequestsDataLoader.data ?? []} refresh={refreshAccessRequests} />
        <Box mt={3}>
          <AlertContainer />
        </Box>
        <Box mt={3}>
          <ActiveUsersList activeUsers={activeUsersDataLoader.data ?? []} refresh={refreshActiveUsers} />
        </Box>
      </Container>
    </>
  );
};

export default AdminManagePage;
