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
import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  actionsContainer: {
    '& p': {
      maxWidth: '80ch'
    }
  },
  heroActions: {
    margin: '0.75em 0',
    fontSize: '1em',
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    gap: '1em'
  },
  heroButton: {
    padding: '0.5em 1.5em',
    fontSize: '0.75em',
    color: theme.palette.primary.main,
    backgroundColor: '#fcba19',
    fontWeight: 700
  },
  heroLink: {
    color: '#fcba19',
    fontWeight: 700
  },
  username: {
    textTransform: 'uppercase'
  },
  pendingRequestAlert: {
    alignItems: 'center',
    maxWidth: '63ch',
    color: theme.palette.primary.contrastText,
    backgroundColor: '#006edc',
    lineHeight: '1.5em',
    margin: '1em 0',
    '& .MuiAlertTitle-root': {
      marginBottom: '0.25em',
      fontSize: '1rem'
    },
    '& .MuiAlert-icon': {
      color: theme.palette.common.white
    },
    '& .MuiAlert-message': {
      padding: '4px 0'
    }
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
  const isAwaitingAccessApproval = hasPendingAccessRequest && !isSystemUser && !mayBelongToOneOrMoreProjects;

  return (
    <Box className={classes.actionsContainer}>
      <UnAuthGuard>
        <>
<<<<<<< HEAD
          <Typography variant="body2">
            To access this application, you must use a valid BC government-issued IDIR or BCeID account credential.
          </Typography>
          <Button
            data-testid="landing_page_login_button"
            component="a"
            href={loginUrl}
            variant="contained"
            className={clsx(classes.heroButton, classes.loginButton)}
            size="large">
            Log In
          </Button>
          <Typography variant="body2">
            Don't have an account? &zwnj;
            <a className={classes.heroLink} target="_blank" href="https://www.bceid.ca/">
              Register here.
=======
          <Typography>
            To access this application, you must use a valid government-issued IDIR or BCeID account.
          </Typography>
          <Box className={classes.heroActions}>
            <Button
              data-testid="landing_page_login_button"
              component="a"
              href={loginUrl}
              variant="contained"
              className={clsx(classes.heroButton, classes.heroButton)}
              size="large">
              Log In
            </Button>
          </Box>
          <Typography>
            Don't have an account? &zwnj;
            <a
              className={classes.heroLink}
              title="Register a BCeID Account"
              target="_blank"
              href="https://www.bceid.ca/os/?7652&SkipTo=Basic">
              Register here
>>>>>>> dev
            </a>
          </Typography>
        </>
      </UnAuthGuard>
      <AuthGuard>
<<<<<<< HEAD
        <Typography variant="body1" className={classes.greeting} data-testid="landing_page_greeting">
=======
        <Typography variant="body1" data-testid="landing_page_greeting">
>>>>>>> dev
          <span>Welcome</span>
          {isReturningUser && <span>&nbsp;back</span>}
          {userIdentifier && (
            <span>
              ,&nbsp;<strong className={classes.username}>{userIdentifier}</strong>
            </span>
          )}
        </Typography>
        {mayMakeAccessRequest && (
          <Typography variant="body2">You have not been granted permission to access this application.</Typography>
        )}
        {isAwaitingAccessApproval && (
          <Alert
            severity="info"
            className={classes.pendingRequestAlert}
<<<<<<< HEAD
            icon={<Icon className={classes.pendingRequestAlertIcon} path={mdiInformationOutline} size={1} />}>
            <AlertTitle className={classes.pendingRequestAlertTitle}>Access request pending</AlertTitle>
            <span>
              You access request for this application is currently under review. You will be notified by email when your
              request has been reviewed.
            </span>
          </Alert>
        )}
        <Box className={classes.actions}>
=======
            icon={<Icon path={mdiInformationOutline} size={1.25} />}>
            <AlertTitle>Access request pending</AlertTitle>
            Your request is currently pending a review by an administrator.
          </Alert>
        )}
        <Box className={classes.heroActions}>
>>>>>>> dev
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
          {(hasAdministrativeRole || (!hasAdministrativeRole && hasProjectCreationRole)) && (
<<<<<<< HEAD
            <Typography component="span">Or</Typography>
=======
            <Typography component="span">OR</Typography>
>>>>>>> dev
          )}
          {hasAdministrativeRole && (
            <Button
              data-testid="landing_page_manage_users_button"
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
  );
};

export default LandingActions;
