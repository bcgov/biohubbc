import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

import UsersDetailHeader from './UsersDetailHeader';
import UsersDetailProjects from './UsersDetailProjects';

import React, { useEffect, useState } from 'react';
import { IGetUserResponse } from '../../../interfaces/useUserApi.interface';

export interface IUsersHeaderProps {
  history: any;
}

/**
 * Page to display user details.
 *
 * @return {*}
 */
const UsersDetailPage: React.FC<IUsersHeaderProps> = (props) => {
  const { history } = props;
  let userDetails = history?.location?.state;

  const [selectedUser, setSelectedUser] = useState<IGetUserResponse>(
    userDetails !== undefined ? userDetails : JSON.parse(window.localStorage.getItem('selectedUser') || '')
  );

  const getUser = () => {
    if (userDetails !== undefined) {
      setSelectedUser(userDetails);
      window.localStorage.setItem('selectedUser', JSON.stringify(userDetails));
    } else {
      setSelectedUser(JSON.parse(window.localStorage.getItem('selectedUser') || ''));
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <UsersDetailHeader userDetails={selectedUser} />

      <Container maxWidth="xl">
        <Box my={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={12}>
              <Box>
                <UsersDetailProjects userDetails={selectedUser} />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default UsersDetailPage;
