import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
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

  if (keycloakWrapper?.hasAccessRequest) {
    // User already has a pending access request
    return <Redirect to={{ pathname: '/request-submitted' }} />;
  }

  const userHasARole = !!keycloakWrapper?.systemRoles?.length;

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiAlertCircleOutline} size={2} color="#ff5252" />
        <h1>Access Denied</h1>
        <Typography>You do not have permission to access this page.</Typography>
        <Box pt={4}>
          {!userHasARole && (
            <Button
              onClick={() => {
                if (keycloakWrapper?.keycloak?.authenticated) {
                  history.push('/access-request');
                } else {
                  // setting page to return to after login
                  history.push('/access-request');
                  keycloakWrapper?.keycloak?.login();
                }
              }}
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
