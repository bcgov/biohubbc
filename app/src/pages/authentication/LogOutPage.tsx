import { mdiArrowRight, mdiDoorClosedLock, mdiDoorOpen } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { makeStyles } from '@mui/styles';
import { AuthStateContext } from 'contexts/authStateContext';
import { ConfigContext } from 'contexts/configContext';
import { useContext, useEffect } from 'react';
import { getLogOutUrl } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  icon: {
    color: theme.palette.primary.main
  }
}));

const LogOutPage = () => {
  const classes = useStyles();

  const { keycloakWrapper } = useContext(AuthStateContext);

  const config = useContext(ConfigContext);

  useEffect(() => {
    if (!config) {
      return;
    }

    const logOutURL = getLogOutUrl(config);

    if (!logOutURL) {
      return;
    }

    keycloakWrapper?.keycloak.removeUser();
    window.location.replace(logOutURL);
  }, [config]);

  return (
    <Container>
      <Box pt={6} textAlign="center">
        <Icon path={mdiDoorOpen} size={2} className={classes.icon} />
        <Icon path={mdiArrowRight} size={2} className={classes.icon} />
        <Icon path={mdiDoorClosedLock} size={2} className={classes.icon} />
        <h1>Logging out...</h1>
      </Box>
    </Container>
  );
};

export default LogOutPage;
