import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <Container>
      <Grid container direction="row">
        <Grid item>
          <h1>Page not found</h1>
          <Link to="/projects">Go back to the projects page</Link>
        </Grid>
      </Grid>
    </Container>
  );
};

export default NotFoundPage;
