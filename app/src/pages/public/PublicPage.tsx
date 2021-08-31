import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { useContext } from 'react';
import { Redirect } from 'react-router';

const PublicPage = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  if (keycloakWrapper?.keycloak?.authenticated) {
    // User has a role
    return <Redirect to={{ pathname: '/projects' }} />;
  }

  return (
    <Container>
      <Box pt={2}>
        <h2>Public View</h2>
      </Box>
    </Container>
  );
};

export default PublicPage;
