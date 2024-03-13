import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useBiohubApi } from '../../../hooks/useBioHubApi';
import { ISystemUser } from '../../../interfaces/useUserApi.interface';
import UsersDetailHeader from './UsersDetailHeader';
import UsersDetailProjects from './UsersDetailProjects';

/**
 * Page to display user details.
 *
 * @return {*}
 */
const UsersDetailPage: React.FC = () => {
  const urlParams: Record<string, string | number | undefined> = useParams();
  const biohubApi = useBiohubApi();

  const [selectedUser, setSelectedUser] = useState<ISystemUser | null>(null);

  useEffect(() => {
    if (selectedUser) {
      return;
    }

    const getUser = async () => {
      const id = urlParams['id'];
      const user = await biohubApi.user.getUserById(Number(id));
      setSelectedUser(user);
    };

    getUser();
  }, [biohubApi.user, urlParams, selectedUser]);

  if (!selectedUser) {
    return <CircularProgress data-testid="page-loading" className="pageProgress" size={40} />;
  }

  return (
    <>
      <UsersDetailHeader userDetails={selectedUser} />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <UsersDetailProjects userDetails={selectedUser} />
      </Container>
    </>
  );
};

export default UsersDetailPage;
