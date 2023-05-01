import { makeStyles, Theme, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import clsx from 'clsx';
import { AuthGuard, UnAuthGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom';


const useStyles = makeStyles((theme: Theme) => ({
  greeting: {
    fontSize: '1.125rem',
    lineHeight: '1.5'
  },
  heroButton: {
    color: theme.palette.primary.main,
    backgroundColor: '#fcba19',
    fontWeight: 700,
    padding: '12px 44px'
  },
  loginButton: {
    textTransform: 'uppercase'
  },
  actionsContainer: {
    maxWidth: '45ch',

    '& p': {
      margin: '1.5rem 0 1rem'
    }
  },
  actions: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    gap: '1rem',

    '& > span': {
      textTransform: 'uppercase'
    }
  },
  heroLink: {
    color: '#fcba19',
    fontWeight: 700,
    textDecoration: 'none'
  },
  username: {
    textTransform: 'uppercase'
  }
}));

const LandingActions = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const classes = useStyles();

  const loginUrl = useMemo(() => keycloakWrapper?.getLoginUrl(), [keycloakWrapper]);
  const userIdentifier = keycloakWrapper?.getUserIdentifier() || '';

  /*
  const hasAnyRole = keycloakWrapper?.hasSystemRole(ALL_SYSTEM_ROLES);

  const hasViewerRole = keycloakWrapper?.hasSystemRole([
    SYSTEM_ROLE.PROJECT_CREATOR
  ])
  */

  const hasAdministrativeRole = keycloakWrapper?.hasSystemRole([
    SYSTEM_ROLE.DATA_ADMINISTRATOR,
    SYSTEM_ROLE.SYSTEM_ADMIN
  ]);

  return (
    <Box className={classes.actionsContainer}>
      <UnAuthGuard>
        <>
          <Typography variant="body2">
            To access this application, you must use a valid BC government-issued IDIR or BCeID account credential.
          </Typography>
          <Button
            component="a"
            href={loginUrl}
            variant="contained"
            className={clsx(classes.heroButton, classes.loginButton)}
            size="large">
            Log In
          </Button>
          {/**
            * Temporarily hiding the Register link. See: https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-30
            <Typography variant="body2">
              Don't have an account? &zwnj;
              <a className={classes.heroLink} href="/link-to-register-an-account">
                Register here.
              </a>
            </Typography>
          */}
        </>
      </UnAuthGuard>
      <AuthGuard>
        <Typography variant="body1" className={classes.greeting}>
          <span>Welcome</span>
          {true && (
            <span>&nbsp;back</span>
          )}
          {userIdentifier && (
            <span>
              ,&nbsp;<strong className={classes.username}>{userIdentifier}</strong>
            </span>
          )}
        </Typography>
        <Box className={classes.actions}>
          <Button
            component={Link}
            to="/admin/projects"
            variant="contained"
            className={classes.heroButton}
            size="large"
            children={<>View&nbsp;Projects</>}
          />
          <Typography component="span">Or</Typography>
          {hasAdministrativeRole ? (
            <Button
              component={Link}
              to="/admin/users"
              variant="contained"
              className={classes.heroButton}
              size="large"
              children={<>Manage&nbsp;Users</>}
            />
          ) : (
            <Button
              component={Link}
              to="/admin/projects/create"
              variant="contained"
              className={classes.heroButton}
              size="large"
              children={<>Create&nbsp;a&nbsp;Project</>}
            />
          )}
        </Box>
      </AuthGuard>
    </Box>
  )
}

export default LandingActions