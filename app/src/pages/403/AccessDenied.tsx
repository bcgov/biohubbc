import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { mdiAlertCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { useContext } from 'react';
import { Redirect, useHistory } from 'react-router';

const AccessDenied = () => {
  const history = useHistory();

  const { keycloakWrapper } = useContext(AuthStateContext);

  if (!keycloakWrapper?.keycloak?.authenticated) {
    // User is not logged in
    return <Redirect to={{ pathname: '/' }} />;
  }

  if (!keycloakWrapper.hasLoadedAllUserInfo) {
    // User data has not been loaded, can not yet determine if they have a role
    return <CircularProgress className="pageProgress" />;
  }

  if (keycloakWrapper.hasAccessRequest) {
    // User already has a pending access request
    return <Redirect to={{ pathname: '/request-submitted' }} />;
  }

  const userHasARole = !!keycloakWrapper?.systemRoles?.length;

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiAlertCircleOutline} size={2} color="#ff5252" />
        <h1>Access Denied</h1>
        <Typography>
          {`You do not have permission to access this ${(userHasARole && 'page') || 'application'}.`}
        </Typography>
        <Box pt={4}>
          {!userHasARole && (
            <Button
              onClick={() => history.push('/access-request')}
              type="submit"
              size="large"
              variant="contained"
              color="primary"
              data-testid="request_access">
              Request Access
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default AccessDenied;
