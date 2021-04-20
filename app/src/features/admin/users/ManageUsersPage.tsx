import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import AccessRequestList from 'features/admin/users/AccessRequestList';
import React from 'react';
import ActiveUsersList from './ActiveUsersList';

/**
 * Page to display user management data/functionality.
 *
 * @return {*}
 */
const ManageUsersPage: React.FC = () => {
  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h1">Manage Users</Typography>
        </Box>
        <Box>
          <AccessRequestList />
        </Box>
        <Box pt={3}>
          <ActiveUsersList />
        </Box>
      </Container>
    </Box>
  );
};

export default ManageUsersPage;
