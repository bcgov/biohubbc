import { mdiInformationOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { AuthGuard, UnAuthGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { useAuthStateContext } from 'contexts/useAuthStateContext';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  actionsContainer: {
    '& p': {
      maxWidth: '80ch'
    }
  },
  heroActions: {
    margin: '0.6em 0',
    fontSize: '1em',
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    gap: '0.5em'
  },
  heroButton: {
    minWidth: '120px',
    padding: '0.75em 1.5em',
    color: theme.palette.primary.main,
    backgroundColor: '#fcba19',
    fontWeight: 700,
    '&:hover': {
      backgroundColor: '#fcba19'
    }
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
  const classes = useStyles();

  const authStateContext = useAuthStateContext();

  const userIdentifier = authStateContext.simsUserWrapper.userIdentifier ?? '';

  const hasPendingAccessRequest = authStateContext.simsUserWrapper.hasAccessRequest;
  const isSystemUser = authStateContext.simsUserWrapper.systemUserId;
  const hasAdministrativeRole = authStateContext.simsUserWrapper.hasSystemRole([
    SYSTEM_ROLE.DATA_ADMINISTRATOR,
    SYSTEM_ROLE.SYSTEM_ADMIN
  ]);

  const mayBelongToOneOrMoreProjects = isSystemUser ?? authStateContext.simsUserWrapper.hasOneOrMoreProjectRoles;
  const hasProjectCreationRole =
    hasAdministrativeRole || authStateContext.simsUserWrapper.hasSystemRole([SYSTEM_ROLE.PROJECT_CREATOR]);
  const isReturningUser = isSystemUser || hasPendingAccessRequest || mayBelongToOneOrMoreProjects;
  const mayViewProjects = isSystemUser || mayBelongToOneOrMoreProjects;
  const mayMakeAccessRequest = !mayViewProjects && !hasPendingAccessRequest;
  const isAwaitingAccessApproval = hasPendingAccessRequest && !isSystemUser && !mayBelongToOneOrMoreProjects;

  return (
    <Box className={classes.actionsContainer}>
      <UnAuthGuard>
        <>
          <Typography>
            To access this application, you must use a valid government-issued IDIR or BCeID account.
          </Typography>
          <Box className={classes.heroActions}>
            <Button
              component="a"
              onClick={() => authStateContext.auth.signinRedirect()}
              variant="contained"
              className={clsx(classes.heroButton, classes.heroButton)}
              size="large"
              data-testid="landing_page_login_button">
              Log In
            </Button>
          </Box>
          <Typography>
            Don't have an account? &zwnj;
            <a
              className={classes.heroLink}
              title="Register a BCeID Account"
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.bceid.ca/directories/bluepages/details.aspx?serviceId=7494&eServiceType=all">
              Register here
            </a>
          </Typography>
        </>
      </UnAuthGuard>
      <AuthGuard>
        <Typography variant="body1" data-testid="landing_page_greeting">
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
            icon={<Icon path={mdiInformationOutline} size={1.25} />}>
            <AlertTitle>Access request pending</AlertTitle>
            Your request is currently pending a review by an administrator.
          </Alert>
        )}
        <Box className={classes.heroActions}>
          {mayViewProjects && (
            <Button
              component={Link}
              to="/admin/projects"
              variant="contained"
              className={classes.heroButton}
              size="large"
              children={<>View&nbsp;Projects</>}
              data-testid="landing_page_projects_button"
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
              data-testid="landing_page_request_access_button"
            />
          )}
          {(hasAdministrativeRole || (!hasAdministrativeRole && hasProjectCreationRole)) && (
            <Typography component="span">OR</Typography>
          )}
          {hasAdministrativeRole && (
            <Button
              component={Link}
              to="/admin/users"
              variant="contained"
              className={classes.heroButton}
              size="large"
              children={<>Manage&nbsp;Users</>}
              data-testid="landing_page_manage_users_button"
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
              data-testid="landing_page_create_project_button"
            />
          )}
        </Box>
      </AuthGuard>
    </Box>
  );
};

export default LandingActions;
