import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { AdministrativeActivityStatusType } from 'constants/misc';
import AccessRequestList from 'features/admin/users/AccessRequestList';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';
import React, { useEffect, useState } from 'react';
import ActiveUsersList from './ActiveUsersList';

/**
 * Page to display user management data/functionality.
 *
 * @return {*}
 */
const ManageUsersPage: React.FC = () => {
  const restorationTrackerApi = useRestorationTrackerApi();

  const [accessRequests, setAccessRequests] = useState<IGetAccessRequestsListResponse[]>([]);
  const [isLoadingAccessRequests, setIsLoadingAccessRequests] = useState(false);
  const [hasLoadedAccessRequests, setHasLoadedAccessRequests] = useState(false);

  const [activeUsers, setActiveUsers] = useState<IGetUserResponse[]>([]);
  const [isLoadingActiveUsers, setIsLoadingActiveUsers] = useState(false);
  const [hasLoadedActiveUsers, setHasLoadedActiveUsers] = useState(false);

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  const refreshAccessRequests = async () => {
    const accessResponse = await restorationTrackerApi.admin.getAccessRequests([
      AdministrativeActivityStatusType.PENDING,
      AdministrativeActivityStatusType.REJECTED
    ]);

    setAccessRequests(accessResponse);
  };

  useEffect(() => {
    const getAccessRequests = async () => {
      const accessResponse = await restorationTrackerApi.admin.getAccessRequests([
        AdministrativeActivityStatusType.PENDING,
        AdministrativeActivityStatusType.REJECTED
      ]);

      setAccessRequests(() => {
        setHasLoadedAccessRequests(true);
        setIsLoadingAccessRequests(false);
        return accessResponse;
      });
    };

    if (isLoadingAccessRequests || hasLoadedAccessRequests) {
      return;
    }

    setIsLoadingAccessRequests(true);

    getAccessRequests();
  }, [restorationTrackerApi.admin, isLoadingAccessRequests, hasLoadedAccessRequests]);

  const refreshActiveUsers = async () => {
    const activeUsersResponse = await restorationTrackerApi.user.getUsersList();

    setActiveUsers(activeUsersResponse);
  };

  useEffect(() => {
    const getActiveUsers = async () => {
      const activeUsersResponse = await restorationTrackerApi.user.getUsersList();

      setActiveUsers(() => {
        setHasLoadedActiveUsers(true);
        setIsLoadingActiveUsers(false);
        return activeUsersResponse;
      });
    };

    if (hasLoadedActiveUsers || isLoadingActiveUsers) {
      return;
    }

    setIsLoadingActiveUsers(true);

    getActiveUsers();
  }, [restorationTrackerApi, isLoadingActiveUsers, hasLoadedActiveUsers]);

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await restorationTrackerApi.codes.getAllCodeSets();

      if (!codesResponse) {
        // TODO error handling/messaging
        return;
      }

      setCodes(() => {
        setIsLoadingCodes(false);
        return codesResponse;
      });
    };

    if (isLoadingCodes || codes) {
      return;
    }

    setIsLoadingCodes(true);

    getCodes();
  }, [restorationTrackerApi.codes, isLoadingCodes, codes]);

  if (!hasLoadedAccessRequests || !hasLoadedActiveUsers || !codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h1">Manage Users</Typography>
        </Box>

        <Box>
          <AccessRequestList
            accessRequests={accessRequests}
            codes={codes}
            refresh={() => {
              refreshAccessRequests();
              refreshActiveUsers();
            }}
          />
        </Box>
        <Box pt={3}>
          <ActiveUsersList activeUsers={activeUsers} codes={codes} refresh={refreshActiveUsers} />
        </Box>
      </Container>
    </Box>
  );
};

export default ManageUsersPage;
