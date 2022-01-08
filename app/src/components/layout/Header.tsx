import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import OtherLink from '@material-ui/core/Link';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { mdiAccountCircle, mdiHelpCircle, mdiLoginVariant } from '@mdi/js';
import Icon from '@mdi/react';
import headerImageLarge from 'assets/images/gov-bc-logo-horiz.png';
import headerImageSmall from 'assets/images/gov-bc-logo-vert.png';
import { AuthGuard, SystemRoleGuard, UnAuthGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { ConfigContext } from 'contexts/configContext';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
  govHeader: {
    borderBottom: '2px solid #fcba19'
  },
  govHeaderToolbar: {
    height: '70px'
  },
  brand: {
    display: 'flex',
    flex: '0 0 auto',
    alignItems: 'center',
    color: 'inherit',
    textDecoration: 'none',
    fontSize: '1.25rem',
    fontWeight: 700,
    '& img': {
      verticalAlign: 'middle'
    },
    '& picture': {
      marginRight: '1.25rem'
    },
    '&:hover': {
      textDecoration: 'none'
    },
    '&:focus': {
      outlineOffset: '6px'
    }
  },
  '@media (max-width: 1000px)': {
    brand: {
      fontSize: '1rem',
      '& picture': {
        marginRight: '1rem'
      }
    },
    wrapText: {
      display: 'block'
    }
  },
  appPhaseTag: {
    marginLeft: theme.spacing(0.5),
    color: '#fcba19',
    textTransform: 'uppercase',
    fontSize: '0.875rem',
    fontWeight: 700
  },
  userProfile: {
    color: theme.palette.primary.contrastText,
    fontSize: '0.9375rem',
    '& hr': {
      backgroundColor: '#4b5e7e',
      height: '1rem'
    },
    '& a': {
      color: 'inherit',
      textDecoration: 'none'
    },
    '& a:hover': {
      textDecoration: 'underline'
    }
  },
  govHeaderIconButton: {
    color: '#ffffff'
  },
  mainNav: {
    backgroundColor: '#38598a'
  },
  mainNavToolbar: {
    '& a': {
      display: 'block',
      padding: theme.spacing(2),
      color: 'inherit',
      fontSize: '1rem',
      textDecoration: 'none'
    },
    '& a:hover': {
      textDecoration: 'underline'
    },
    '& a:first-child': {
      marginLeft: theme.spacing(-2)
    }
  },
  '.MuiDialogContent-root': {
    '& p + p': {
      marginTop: theme.spacing(2)
    }
  }
}));

const Header: React.FC = () => {
  const classes = useStyles();
  const config = useContext(ConfigContext);

  const { keycloakWrapper } = useContext(AuthStateContext);

  // Authenticated view
  const LoggedInUser = () => {
    const loggedInUserDisplayName = `${keycloakWrapper?.getIdentitySource()} / ${keycloakWrapper?.getUserIdentifier()}`.toUpperCase();

    return (
      <Box display="flex" className={classes.userProfile} my="auto" alignItems="center">
        <Icon path={mdiAccountCircle} size={1.12} />
        <Box ml={1}>{loggedInUserDisplayName}</Box>
        <Box px={2}>
          <Divider orientation="vertical" />
        </Box>
        <Link to="/logout" data-testid="menu_log_out">
          Log Out
        </Link>
        <Box pl={2}>
          <Divider orientation="vertical" />
        </Box>
        <IconButton className={classes.govHeaderIconButton} onClick={showSupportDialog}>
          <Icon path={mdiHelpCircle} size={1.12} />
        </IconButton>
      </Box>
    );
  };

  // Unauthenticated public view
  const PublicViewUser = () => {
    return (
      <Box display="flex" alignItems="center" my="auto">
        <Button
          onClick={() => keycloakWrapper?.keycloak?.login()}
          size="large"
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          startIcon={<Icon path={mdiLoginVariant} size={1.12} />}
          data-testid="login">
          Log In
        </Button>
        <Box pl={2}>
          <Divider orientation="vertical" />
        </Box>
        <IconButton className={classes.govHeaderIconButton} onClick={showSupportDialog}>
          <Icon path={mdiHelpCircle} size={1.12} />
        </IconButton>
      </Box>
    );
  };

  const [open, setOpen] = React.useState(false);
  const preventDefault = (event: React.SyntheticEvent) => event.preventDefault();

  const showSupportDialog = () => {
    setOpen(true);
  };

  const hideSupportDialog = () => {
    setOpen(false);
  };

  const BetaLabel = () => {
    return (
      <sup className={classes.appPhaseTag} aria-label="This application is currently in beta phase of development">
        Beta
      </sup>
    );
  };

  const EnvironmentLabel = () => {
    if (config?.REACT_APP_NODE_ENV === 'prod') {
      return <></>;
    }

    return (
      <sup
        className={classes.appPhaseTag}
        aria-label={`This application is currently being run in the ${config?.REACT_APP_NODE_ENV} environment`}>
        & {config?.REACT_APP_NODE_ENV}
      </sup>
    );
  };

  return (
    <>
      <AppBar position="sticky" style={{ boxShadow: 'none' }}>
        <Box className={classes.govHeader}>
          <Toolbar className={classes.govHeaderToolbar}>
            <Container maxWidth="xl">
              <Box display="flex" justifyContent="space-between" width="100%">
                <Link to="/projects" className={classes.brand} aria-label="Go to Restoration Tracker Home">
                  <picture>
                    <source srcSet={headerImageLarge} media="(min-width: 1200px)"></source>
                    <source srcSet={headerImageSmall} media="(min-width: 600px)"></source>
                    <img src={headerImageSmall} alt={'Government of British Columbia'} />
                  </picture>
                  <span>
                    Restoration Tracker
                    <BetaLabel />
                    <EnvironmentLabel />
                  </span>
                </Link>
                <UnAuthGuard>
                  <PublicViewUser />
                </UnAuthGuard>
                <AuthGuard>
                  <LoggedInUser />
                </AuthGuard>
              </Box>
            </Container>
          </Toolbar>
        </Box>
        <Box className={classes.mainNav}>
          <Container maxWidth="xl">
            <Toolbar
              variant="dense"
              className={classes.mainNavToolbar}
              role="navigation"
              aria-label="Main Navigation"
              disableGutters>
              <UnAuthGuard>
                <Link to="/" id="menu_projects">
                  Projects
                </Link>
              </UnAuthGuard>
              <AuthGuard>
                <Link to="/admin/projects" id="menu_projects">
                  Projects
                </Link>
                <Link to="/admin/permits" id="menu_permits">
                  Permits
                </Link>
              </AuthGuard>
              <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}>
                <Link to="/admin/users" id="menu_admin_users">
                  Manage Users
                </Link>
              </SystemRoleGuard>
            </Toolbar>
          </Container>
        </Box>
      </AppBar>

      <Dialog open={open}>
        <DialogTitle>Need Help?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            For technical support or questions about this application, please contact:&nbsp;
            <OtherLink
              href="mailto:restoration-tracker@gov.bc.ca?subject=Restoration Tracker - Secure Document Access Request"
              underline="always"
              onClick={preventDefault}>
              restoration-tracker@gov.bc.ca
            </OtherLink>
            .
          </Typography>
          <Typography variant="body1">A support representative will respond to your request shortly.</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={hideSupportDialog}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
