import React from 'react';
import { Container, Grid } from '@material-ui/core';
import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <Container>
      <Grid container direction="row">
        <Grid item>
          <h1>Page not found</h1>
          <Link to="/home">Go back to the home page</Link>
        </Grid>
      </Grid>
    </Container>
  );
};
