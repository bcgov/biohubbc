import { mdiInformationOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import { AuthGuard, UnAuthGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { Link } from 'react-router-dom';
import { hasAtLeastOneValidValue } from 'utils/authUtils';

const useStyles = () => {
  const theme = useTheme();

  return {
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
      minWidth: '175px',
      padding: '1em 1.5em',
      color: theme.palette.primary.main,
      backgroundColor: '#fcba19',
      fontWeight: 700,
      '&:hover': {
        backgroundColor: '#fcba19'
      }
    },
    pendingRequestAlert: {
      maxWidth: '63ch',
      mt: 1
    }
  };
};

const LandingActions = () => {
  const classes = useStyles();

  const authStateContext = useAuthStateContext();

  const userIdentifier = authStateContext.simsUserWrapper.userIdentifier ?? '';

  const hasPendingAccessRequest = authStateContext.simsUserWrapper.hasAccessRequest;
  const isSystemUser = !!authStateContext.simsUserWrapper.systemUserId;

  const hasAdministrativeRole = hasAtLeastOneValidValue(
    [SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN],
    authStateContext.simsUserWrapper.roleNames
  );
  const isInvalidUser = !!authStateContext.simsUserWrapper.recordEndDate;
  const mayBelongToOneOrMoreProjects = isSystemUser ?? authStateContext.simsUserWrapper.hasOneOrMoreProjectRoles;
  const hasProjectCreationRole =
    hasAdministrativeRole ||
    hasAtLeastOneValidValue([SYSTEM_ROLE.PROJECT_CREATOR], authStateContext.simsUserWrapper.roleNames);
  const isReturningUser = isSystemUser || hasPendingAccessRequest || mayBelongToOneOrMoreProjects;
  const mayViewProjects = (isSystemUser || mayBelongToOneOrMoreProjects) && !isInvalidUser;
  const mayMakeAccessRequest = !mayViewProjects && !hasPendingAccessRequest && !isInvalidUser;
  const isAwaitingAccessApproval =
    hasPendingAccessRequest && !isSystemUser && !mayBelongToOneOrMoreProjects && !isInvalidUser;

  return (
    <Box sx={classes.actionsContainer}>
      <UnAuthGuard>
        <>
          <Box sx={classes.heroActions}>
            <Button
              component="a"
              onClick={() => authStateContext.auth.signinRedirect()}
              variant="contained"
              sx={{ ...classes.heroButton, ...classes.heroButton }}
              size="large"
              data-testid="landing_page_login_button">
              Log In
            </Button>
          </Box>
          <Typography variant="body2" color="primary">
            You need a valid government-issued IDIR or BCeID account to log in.
          </Typography>
          <Typography variant="body2" color="primary">
            Don't have an account? &zwnj;
            <a
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
        <Typography color="primary.dark" data-testid="landing_page_greeting">
          <span>Welcome</span>
          {isReturningUser && <span>&nbsp;back</span>}
          {userIdentifier && (
            <span>
              ,&nbsp;<strong style={{ textTransform: 'uppercase' }}>{userIdentifier}</strong>
            </span>
          )}
        </Typography>
        {mayMakeAccessRequest && (
          <Typography variant="body2" color="primary">
            You have not yet been granted access to this application.
          </Typography>
        )}
        {isAwaitingAccessApproval && (
          <Alert
            severity="info"
            variant="filled"
            sx={classes.pendingRequestAlert}
            icon={<Icon path={mdiInformationOutline} size={1} />}>
            <AlertTitle>Access request pending</AlertTitle>
            Your request is currently pending a review by an administrator.
          </Alert>
        )}
        {isInvalidUser && (
          <Alert
            severity="error"
            variant="filled"
            sx={classes.pendingRequestAlert}
            icon={<Icon path={mdiInformationOutline} size={1} />}>
            <AlertTitle>Access Denied</AlertTitle>
            You cannot request access. Please contact a system administrator.
          </Alert>
        )}
        <Box sx={classes.heroActions}>
          {mayViewProjects && (
            <Button
              component={Link}
              to="/admin/summary"
              variant="contained"
              sx={classes.heroButton}
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
              sx={classes.heroButton}
              size="large"
              children={<>Request&nbsp;Access</>}
              data-testid="landing_page_request_access_button"
            />
          )}
          {!hasAdministrativeRole && hasProjectCreationRole && (
            <Button
              component={Link}
              to="/admin/projects/create"
              variant="contained"
              sx={classes.heroButton}
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
