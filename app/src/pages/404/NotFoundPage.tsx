import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { mdiHelpCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import React from 'react';
import { useHistory } from 'react-router';

const NotFoundPage = () => {
  const history = useHistory();

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiHelpCircleOutline} size={2} color="#ff5252" />
        <h1>Page Not Found</h1>
        <Typography>Sorry, the page you are trying to access does not exist.</Typography>
        <Box pt={4}>
          <Button onClick={() => history.push('/')} type="submit" size="large" variant="contained" color="primary">
            Return Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
