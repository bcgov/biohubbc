import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import PageHeader from 'components/layout/PageHeader';
import { AdministrativeActivityStatusType, AdministrativeActivityType } from 'constants/misc';
import AccessRequestList from 'features/admin/users/AccessRequestList';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAccessRequestsListResponse } from 'interfaces/useAdminApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import React, { useEffect, useState } from 'react';
import ActiveUsersList from './ActiveUsersList';

/**
 * Page to display user management data/functionality.
 *
 * @return {*}
 */
const ManageUsersPage: React.FC = () => {
  const biohubApi = useBiohubApi();

  const [accessRequests, setAccessRequests] = useState<IGetAccessRequestsListResponse[]>([]);
  const [isLoadingAccessRequests, setIsLoadingAccessRequests] = useState(false);
  const [hasLoadedAccessRequests, setHasLoadedAccessRequests] = useState(false);

  const [activeUsers, setActiveUsers] = useState<ISystemUser[]>([]);
  const [isLoadingActiveUsers, setIsLoadingActiveUsers] = useState(false);
  const [hasLoadedActiveUsers, setHasLoadedActiveUsers] = useState(false);

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  const refreshAccessRequests = async () => {
    const accessResponse = await biohubApi.admin.getAdministrativeActivities(
      [AdministrativeActivityType.SYSTEM_ACCESS],
      [AdministrativeActivityStatusType.PENDING, AdministrativeActivityStatusType.REJECTED]
    );

    setAccessRequests(accessResponse);
  };

  useEffect(() => {
    const getAccessRequests = async () => {
      const accessResponse = await biohubApi.admin.getAdministrativeActivities(
        [AdministrativeActivityType.SYSTEM_ACCESS],
        [AdministrativeActivityStatusType.PENDING, AdministrativeActivityStatusType.REJECTED]
      );

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
  }, [biohubApi.admin, isLoadingAccessRequests, hasLoadedAccessRequests]);

  const refreshActiveUsers = async () => {
    const activeUsersResponse = await biohubApi.user.getUsersList();

    setActiveUsers(activeUsersResponse);
  };

  useEffect(() => {
    const getActiveUsers = async () => {
      const activeUsersResponse = await biohubApi.user.getUsersList();

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
  }, [biohubApi, isLoadingActiveUsers, hasLoadedActiveUsers]);

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await biohubApi.codes.getAllCodeSets();

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
  }, [biohubApi.codes, isLoadingCodes, codes]);

  if (!hasLoadedAccessRequests || !hasLoadedActiveUsers || !codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <PageHeader title="Manage Users" />
      <Container maxWidth="xl">
        <Box py={3}>
          <AccessRequestList
            accessRequests={accessRequests}
            codes={codes}
            refresh={() => {
              refreshAccessRequests();
              refreshActiveUsers();
            }}
          />
          <Box mt={3}>
            <ActiveUsersList activeUsers={activeUsers} codes={codes} refresh={refreshActiveUsers} />
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default ManageUsersPage;
