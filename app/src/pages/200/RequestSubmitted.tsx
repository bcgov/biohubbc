import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import React, { useContext } from 'react';
import { mdiCheck } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { ConfigContext } from 'contexts/configContext';

const RequestSubmitted = () => {
  const config = useContext(ConfigContext);

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiCheck} size={2} color="#4caf50" />
        <h1>Access Request Submitted</h1>
        <Typography>Your access request has been submitted for review.</Typography>
        <Box pt={4}>
          <Button
            onClick={() => {
              if (!config || !config.KEYCLOAK_CONFIG || !config.KEYCLOAK_CONFIG.url) {
                return;
              }

              window.location.href = `${config.KEYCLOAK_CONFIG.url}/realms/${
                config.KEYCLOAK_CONFIG.realm
              }/protocol/openid-connect/logout?redirect_uri=${encodeURI(window.location.origin)}/${encodeURI(
                'access-request'
              )}`;
            }}
            type="submit"
            size="large"
            variant="contained"
            color="primary">
            Logout
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default RequestSubmitted;
