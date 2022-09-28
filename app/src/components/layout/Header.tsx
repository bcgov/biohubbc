import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
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
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme: Theme) => ({
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
    marginLeft: theme.spacing(0.75),
    color: '#fcba19',
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    fontWeight: 400
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

function getDisplayName(userName: string, identitySource: string) {
  return identitySource === SYSTEM_IDENTITY_SOURCE.BCEID ? `BCEID / ${userName}` : `IDIR / ${userName}`;
}

const Header: React.FC = () => {
  const classes = useStyles();
  const config = useContext(ConfigContext);

  const { keycloakWrapper } = useContext(AuthStateContext);

  // Authenticated view
  const LoggedInUser = () => {
    const identitySource = keycloakWrapper?.getIdentitySource() || '';

    const userIdentifier = keycloakWrapper?.getUserIdentifier() || '';

    const loggedInUserDisplayName = getDisplayName(userIdentifier, identitySource);

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
        <IconButton aria-label="need help" className={classes.govHeaderIconButton} onClick={showSupportDialog}>
          <Icon path={mdiHelpCircle} size={1.12} />
        </IconButton>
      </Box>
    );
  };

  // Unauthenticated public view
  const PublicViewUser = () => {
    return (
      <Box display="flex" className={classes.userProfile} alignItems="center" my="auto">
        <Button
          onClick={() => keycloakWrapper?.keycloak?.login()}
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          startIcon={<Icon path={mdiLoginVariant} size={1.12} />}
          data-testid="login">
          Log In
        </Button>
        <IconButton className={classes.govHeaderIconButton} onClick={showSupportDialog}>
          <Icon path={mdiHelpCircle} size={1.12} />
        </IconButton>
      </Box>
    );
  };

  const [open, setOpen] = React.useState(false);

  const showSupportDialog = () => {
    setOpen(true);
  };

  const hideSupportDialog = () => {
    setOpen(false);
  };

  const BetaLabel = () => {
    return <span aria-label="This application is currently in beta phase of development">Beta</span>;
  };

  const EnvironmentLabel = () => {
    if (config?.REACT_APP_NODE_ENV === 'prod') {
      return <></>;
    }

    return (
      <span aria-label={`This application is currently being run in the ${config?.REACT_APP_NODE_ENV} environment`}>
        & {config?.REACT_APP_NODE_ENV}
      </span>
    );
  };

  return (
    <>
      <AppBar position="sticky" style={{ boxShadow: 'none' }}>
        <Toolbar className={classes.govHeaderToolbar}>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Link to="/projects" className={classes.brand} aria-label="Go to SIMS Home">
              <picture>
                <source srcSet={headerImageLarge} media="(min-width: 1200px)"></source>
                <source srcSet={headerImageSmall} media="(min-width: 600px)"></source>
                <img src={headerImageSmall} alt={'Government of British Columbia'} />
              </picture>
              <span>
                Species Inventory Management System
                <sup className={classes.appPhaseTag}>
                  <BetaLabel />
                  &nbsp;
                  <EnvironmentLabel />
                </sup>
              </span>
            </Link>
            <UnAuthGuard>
              <PublicViewUser />
            </UnAuthGuard>
            <AuthGuard>
              <LoggedInUser />
            </AuthGuard>
          </Box>
        </Toolbar>

        <AuthGuard>
          <Box className={classes.mainNav}>
            <Toolbar variant="dense" className={classes.mainNavToolbar} role="navigation" aria-label="Main Navigation">
              <Link to="/admin/projects" id="menu_projects">
                Projects
              </Link>
              <Link to="/admin/search" id="menu_search">
                Map
              </Link>
              <Link to="/admin/resources" id="menu_resources">
                Resources
              </Link>
              <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}>
                <Link to="/admin/users" id="menu_admin_users">
                  Manage Users
                </Link>
              </SystemRoleGuard>
            </Toolbar>
          </Box>
        </AuthGuard>
      </AppBar>

      <Dialog open={open}>
        <DialogTitle>Need Help?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="div" color="textSecondary" gutterBottom>
            For technical support or questions about this application, please contact:&nbsp;
            <OtherLink
              href="mailto:biohub@gov.bc.ca?subject=BioHub - Secure Document Access Request"
              underline="always">
              biohub@gov.bc.ca
            </OtherLink>
            .
          </Typography>
          <Typography variant="body1" color="textSecondary">
            A support representative will respond to your request shortly.
          </Typography>
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
