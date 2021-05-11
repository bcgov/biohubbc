import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiDoorClosedLock } from '@mdi/js';
import Icon from '@mdi/react';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { useContext } from 'react';
import { Redirect } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    color: theme.palette.primary.main
  }
}));

const LogInPage: React.FC = () => {
  const classes = useStyles();

  const { keycloakWrapper } = useContext(AuthStateContext);

  if (keycloakWrapper?.keycloak?.authenticated) {
    if (!keycloakWrapper.hasLoadedAllUserInfo) {
      // User data has not been loaded, can not yet determine if they have a role
      return <CircularProgress className="pageProgress" />;
    }

    if (keycloakWrapper.hasAccessRequest) {
      // User already has a pending access request
      return <Redirect to={{ pathname: '/request-submitted' }} />;
    }

    // User has a role
    return <Redirect to={{ pathname: '/projects' }} />;
  }

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiDoorClosedLock} size={2} className={classes.icon} />
        <h1>Welcome to BioHub</h1>
        <Typography>{`You must log in to access this application.`}</Typography>
        <Box pt={4}>
          <Button
            onClick={() => keycloakWrapper?.keycloak.login()}
            type="submit"
            size="large"
            variant="contained"
            color="primary"
            data-testid="login">
            Log In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LogInPage;
