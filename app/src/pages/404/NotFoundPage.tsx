import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { mdiHelpCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
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
