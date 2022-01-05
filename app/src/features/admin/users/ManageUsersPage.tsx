import { Button } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { AdministrativeActivityStatusType } from 'constants/misc';
import AccessRequestList from 'features/admin/users/AccessRequestList';
import { useBiohubApi } from 'hooks/useBioHubApi';
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
  const biohubApi = useBiohubApi();

  const [accessRequests, setAccessRequests] = useState<IGetAccessRequestsListResponse[]>([]);
  const [isLoadingAccessRequests, setIsLoadingAccessRequests] = useState(false);
  const [hasLoadedAccessRequests, setHasLoadedAccessRequests] = useState(false);

  const [activeUsers, setActiveUsers] = useState<IGetUserResponse[]>([]);
  const [isLoadingActiveUsers, setIsLoadingActiveUsers] = useState(false);
  const [hasLoadedActiveUsers, setHasLoadedActiveUsers] = useState(false);

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  const refreshAccessRequests = async () => {
    const accessResponse = await biohubApi.admin.getAccessRequests([
      AdministrativeActivityStatusType.PENDING,
      AdministrativeActivityStatusType.REJECTED
    ]);

    setAccessRequests(accessResponse);
  };

  useEffect(() => {
    const getAccessRequests = async () => {
      const accessResponse = await biohubApi.admin.getAccessRequests([
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

  const sendEmail = () => {
    const recipientAddress = 'Kjartan.Einarsson@gov.bc.ca';
    const message = {
      header: 'Hello Kjartan,',
      main_body1: 'This is a message from the Species Inventory Management System (((env))) ((url)).',
      main_body2: 'Your request to become an ((request_type)) was received on ((request_date)).',
      footer: 'We will contact you after your request has been reviewed by a member of our team.'
    };
    const templateFormat = 'email';

    biohubApi.admin.sendGCNotification(recipientAddress, message, templateFormat);
  };

  const sendSms = () => {
    const recipientAddress = '2505070444';
    const message = {
      header: 'Hello Kjartan,',
      main_body1: 'This is a message from the Species Inventory Management System (((env))) ((url)).',
      main_body2: 'Your request to become an ((request_type)) was received on ((request_date)).',
      footer: 'We will contact you after your request has been reviewed by a member of our team.'
    };
    const templateFormat = 'sms';

    biohubApi.admin.sendGCNotification(recipientAddress, message, templateFormat);
  };

  if (!hasLoadedAccessRequests || !hasLoadedActiveUsers || !codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h1">Manage Users</Typography>
        </Box>
        <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
          <Button onClick={sendEmail}> TEMP TEST EMAIL SEND</Button>
        </Box>
        <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
          <Button onClick={sendSms}> TEMP TEST SMS SEND</Button>
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
