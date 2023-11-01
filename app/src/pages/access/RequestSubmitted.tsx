import { mdiCheck } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { Redirect } from 'react-router';

const RequestSubmitted = () => {
  const authStateContext = useAuthStateContext();

  if (authStateContext.simsUserWrapper.isLoading) {
    // User data has not been loaded, can not yet determine if they have a role
    return <CircularProgress className="pageProgress" />;
  }

  if (!authStateContext.simsUserWrapper.hasAccessRequest || authStateContext.simsUserWrapper.roleNames?.length) {
    // User has no pending access request or already has a role
    return <Redirect to={{ pathname: '/' }} />;
  }

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiCheck} size={2} color="#4caf50" />
        <h1>Access Request Submitted</h1>
        <Typography>Your request is currently pending a review by an administrator.</Typography>
        <Box pt={4}>
          <Button
            component="a"
            onClick={() => authStateContext.auth.signoutRedirect()}
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            data-testid="logout-button">
            Log Out
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RequestSubmitted;
