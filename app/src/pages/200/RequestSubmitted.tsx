import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { mdiCheck } from '@mdi/js';
import Icon from '@mdi/react';
import { AuthStateContext } from 'contexts/authStateContext';
import { ConfigContext } from 'contexts/configContext';
import React, { useContext } from 'react';
import { Redirect } from 'react-router';
import { logOut } from 'utils/Utils';

const RequestSubmitted = () => {
  const config = useContext(ConfigContext);

  const { keycloakWrapper } = useContext(AuthStateContext);

  if (!keycloakWrapper?.hasLoadedAllUserInfo) {
    // User data has not been loaded, can not yet determine if they have a role
    return <CircularProgress className="pageProgress" />;
  }

  if (keycloakWrapper?.systemRoles.length) {
    // User already has a role
    return <Redirect to={{ pathname: '/' }} />;
  }

  if (!keycloakWrapper.hasAccessRequest) {
    // User has no pending access request
    return <Redirect to={{ pathname: '/' }} />;
  }

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiCheck} size={2} color="#4caf50" />
        <h1>Access Request Submitted</h1>
        <Typography>Your access request has been submitted for review.</Typography>
        <Box pt={4}>
          <Button
            onClick={() => {
              if (!config) {
                return;
              }

              logOut(config);
            }}
            type="submit"
            size="large"
            variant="contained"
            color="primary">
            Log Out
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RequestSubmitted;
