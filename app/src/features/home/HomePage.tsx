import { Box, Container, Typography } from '@material-ui/core';
import React from 'react';

/**
 * The home page.
 *
 * @return {*}
 */
const HomePage: React.FC = () => {
  return (
    <Box my={3}>
      <Container>
        <Box>
          <Typography variant="h4">Welcome to BioHub!</Typography>
          <Typography variant="body1">There is nothing on this page yet.</Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
