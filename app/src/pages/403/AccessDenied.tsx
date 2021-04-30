import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import React, { useContext } from 'react';
import { mdiAlertCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { useHistory } from 'react-router';
import { AuthStateContext } from 'contexts/authStateContext';

const AccessDenied = () => {
  const history = useHistory();

  const { keycloakWrapper } = useContext(AuthStateContext);

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
              color="primary">
              Request Access
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default AccessDenied;
