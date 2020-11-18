import * as React from 'react';
import { Link } from 'react-router-dom';
import { Container, Grid } from '@material-ui/core';

const AccessDenied = () => {
  return (
    <Container>
      <Grid container direction="row">
        <Grid item>
          <h1>Access Denied</h1>
          <h2>You do not have permission to view this page</h2>
          <Link to="/home/activities">Go back to the activities page</Link>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AccessDenied;
