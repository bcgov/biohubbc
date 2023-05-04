import { makeStyles, Theme, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { mdiInformationOutline } from '@mdi/js';
import Icon from '@mdi/react';
import clsx from 'clsx';
import { AuthGuard, UnAuthGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { useContext, useMemo } from 'react'
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  greeting: {
    fontSize: '1.25em',
    lineHeight: '1.5'
  },
  heroButton: {
    fontSize: '1em',
    color: theme.palette.primary.main,
    backgroundColor: '#fcba19',
    fontWeight: 700,
    padding: '0.75em 3em'
  },
  loginButton: {
    textTransform: 'uppercase'
  },
  actionsContainer: {
    '& p': {
      fontSize: '1em',
      margin: '1.5em 0',
      maxWidth: '60ch'
    }
  },
  actions: {
    fontSize: '1em',
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    gap: '1em',

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
  },
  pendingRequestAlert: {
    color: theme.palette.primary.contrastText,
    backgroundColor: '#006edc',
    width: '100%',
    fontSize: '0.875em',
    lineHeight: '1.5em',
    alignItems: 'center',
    margin: '1em 0',
    padding: '0.5em 1.5em'
  },
  pendingRequestAlertIcon: {
    color: theme.palette.common.white
  },
  pendingRequestAlertTitle: {
    marginBottom: '0.5em'
  }
}));

const LandingActions = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const classes = useStyles();

  const loginUrl = useMemo(() => keycloakWrapper?.getLoginUrl(), [keycloakWrapper]);
  const userIdentifier = keycloakWrapper?.getUserIdentifier() || '';

  const hasPendingAccessRequest = keycloakWrapper?.hasAccessRequest;
  const isSystemUser = keycloakWrapper?.isSystemUser();
  const hasAdministrativeRole = keycloakWrapper?.hasSystemRole([
    SYSTEM_ROLE.DATA_ADMINISTRATOR,
    SYSTEM_ROLE.SYSTEM_ADMIN
  ]);

  const mayBelongToOneOrMoreProjects = isSystemUser || keycloakWrapper?.hasOneOrMoreProjectRoles;  
  const hasProjectCreationRole = hasAdministrativeRole || keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.PROJECT_CREATOR]);
  const isReturningUser = isSystemUser || hasPendingAccessRequest || mayBelongToOneOrMoreProjects;
  const mayViewProjects = isSystemUser || mayBelongToOneOrMoreProjects;
  const mayMakeAccessRequest = !mayViewProjects && !hasPendingAccessRequest;
  const isAwaitingAccessApproval = hasPendingAccessRequest && !isSystemUser && !mayBelongToOneOrMoreProjects

  return (
    <Box className={classes.actionsContainer}>
      <UnAuthGuard>
        <>
          <Typography variant="body2">
            To access this application, you must use a valid BC government-issued IDIR or BCeID account credential.
          </Typography>
          <Button
            data-testid='landing_page_login_button'
            component="a"
            href={loginUrl}
            variant="contained"
            className={clsx(classes.heroButton, classes.loginButton)}
            size="large">
            Log In
          </Button>
          {/**
            * Temporarily hiding the Register link. See: https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-30
            */}
            <Typography variant="body2">
              Don't have an account? &zwnj;
              <a className={classes.heroLink} href="/link-to-register-an-account">
                Register here.
              </a>
            </Typography>
        </>
      </UnAuthGuard>
      <AuthGuard>
        <Typography variant="body1" className={classes.greeting} data-testid="landing_page_greeting">
          <span>Welcome</span>
          {isReturningUser && (
            <span>&nbsp;back</span>
          )}
          {userIdentifier && (
            <span>,&nbsp;<strong className={classes.username}>{userIdentifier}</strong></span>
          )}
        </Typography>
        {mayMakeAccessRequest && (
          <Typography variant="body2">
            You have not been granted permission to access this application.
          </Typography>
        )}
        {isAwaitingAccessApproval && (
          <Alert
            severity='info'
            className={classes.pendingRequestAlert}
            icon={<Icon className={classes.pendingRequestAlertIcon} path={mdiInformationOutline} size={1} />}>
            <AlertTitle className={classes.pendingRequestAlertTitle}>Access request pending</AlertTitle>
            <span>You access request for this application is currently under review. You will be notified by email when your request has been reviewed.</span>
          </Alert>
        )}
        <Box className={classes.actions}>
          {mayViewProjects && (
            <Button
              component={Link}
              to="/admin/projects"
              variant="contained"
              className={classes.heroButton}
              size="large"
              children={<>View&nbsp;Projects</>}
            />
          )}
          {mayMakeAccessRequest && ( 
            <Button
              component={Link}
              to="/access-request"
              variant="contained"
              className={classes.heroButton}
              size="large"
              children={<>Request&nbsp;Access</>}
            />
          )}
          {false && isAwaitingAccessApproval && (
            <Button
              component={Link}
              to="/logout"
              variant="contained"
              className={classes.heroButton}
              size="large"
              children={<>Log&nbsp;Out</>}
            />
          )}
          {(hasAdministrativeRole || (!hasAdministrativeRole && hasProjectCreationRole)) && (
            <Typography component="span">Or</Typography>
          )}
          {hasAdministrativeRole && (
            <Button
              component={Link}
              to="/admin/users"
              variant="contained"
              className={classes.heroButton}
              size="large"
              children={<>Manage&nbsp;Users</>}
            />
          )}
          {!hasAdministrativeRole && hasProjectCreationRole && (
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