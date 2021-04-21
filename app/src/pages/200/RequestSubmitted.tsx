import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import React from 'react';
import { mdiCheck } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';


const RequestSubmitted = () => {

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiCheck} size={2} color="#4caf50" />
        <h1>Access Request Submitted</h1>
        <Typography>Your access request has been submitted for review.</Typography>
        <Box pt={4}>
          <Button
            onClick={async () => {
              window.location.href =
                'https://dev.oidc.gov.bc.ca/auth/realms/35r1iman/protocol/openid-connect/logout?redirect_uri=' +
                encodeURI(window.location.origin) +
                '%2Faccess-request';
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
