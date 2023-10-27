import { mdiAlertCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useAuthStateContext } from 'contexts/useAuthStateContext';
import { Redirect, useHistory } from 'react-router';
import { buildUrl } from 'utils/Utils';

const AccessDenied = () => {
  const history = useHistory();

  const authStateContext = useAuthStateContext();

  if (authStateContext.simsUserWrapper.hasAccessRequest) {
    // User already has a pending access request
    return <Redirect to={{ pathname: '/request-submitted' }} />;
  }

  const showRequestAccessButton =
    authStateContext.simsUserWrapper.isReady && !authStateContext.simsUserWrapper.roleNames?.length;

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiAlertCircleOutline} size={2} color="#ff5252" />
        <h1>Access Denied</h1>
        <Typography>You do not have permission to access this page.</Typography>
        <Box pt={4}>
          {showRequestAccessButton && (
            <Button
              onClick={() => {
                if (authStateContext.auth.isAuthenticated) {
                  history.push('/access-request');
                } else {
                  authStateContext.auth.signinRedirect({
                    redirect_uri: buildUrl(window.location.origin, '/access-request')
                  });
                }
              }}
              type="submit"
              size="large"
              variant="contained"
              color="primary"
              data-testid="access_denied_request_access_button">
              Request Access
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default AccessDenied;
