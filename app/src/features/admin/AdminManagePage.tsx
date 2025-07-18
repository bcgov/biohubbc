import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import PageHeader from 'components/layout/PageHeader';
import { AdministrativeActivityStatusType, AdministrativeActivityType } from 'constants/misc';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import AlertContainer from './alert/AlertContainer';
import AccessRequestContainer from './users/access-requests/AccessRequestContainer';
import ActiveUsersList from './users/active/ActiveUsersTableContainer';

const AdminManagePage = () => {
  const biohubApi = useBiohubApi();

  // ACCESS REQUESTS
  const accessRequestsDataLoader = useDataLoader(() =>
    biohubApi.admin.getAdministrativeActivities(
      [AdministrativeActivityType.SYSTEM_ACCESS],
      [
        AdministrativeActivityStatusType.INVITED,
        AdministrativeActivityStatusType.PENDING,
        AdministrativeActivityStatusType.REJECTED,
        AdministrativeActivityStatusType.ACTIONED
      ]
    )
  );

  useEffect(() => {
    accessRequestsDataLoader.load();
  }, [accessRequestsDataLoader]);

  const refreshAccessRequests = () => {
    accessRequestsDataLoader.refresh();
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
          <ActiveUsersList />
        </Box>
      </Container>
    </>
  );
};

export default AdminManagePage;
