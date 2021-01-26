import { Container, Grid } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';

const AccessDenied = () => {
  return (
    <Container>
      <Grid container direction="row">
        <Grid item>
          <h1>Access Denied</h1>
          <h2>You do not have permission to view this page</h2>
          <Link to="/projects">Go back to the projects page</Link>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AccessDenied;
