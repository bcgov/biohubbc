import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

import UsersDetailHeader from './UsersDetailHeader';
import UsersDetailProjects from './UsersDetailProjects';

import { useEffect, useState } from 'react';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';
import React from 'react';

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
    JSON.parse(window.localStorage.getItem('selectedUser') || '') !== null
      ? JSON.parse(window.localStorage.getItem('selectedUser') || '')
      : userDetails
  );

  useEffect(() => {
    //console.log("EFFFECT TIME");
    getUser();
  }, []);

  const getUser =  () => {
    if (userDetails !== undefined) {
      setSelectedUser(userDetails);
      window.localStorage.setItem('selectedUser', JSON.stringify(userDetails));
      //console.log("FIRST TIME");
    } else {
      setSelectedUser(JSON.parse(window.localStorage.getItem('selectedUser') || ''));
      //console.log("ReLOADING COVER ME " +JSON.stringify(selectedUser));
    }
  };

  //console.log("ssssrDETAILS " +JSON.stringify(selectedUser));
  //console.log("THIS IS SESSION STORE: " +window.localStorage.getItem('selectedUser'));

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
