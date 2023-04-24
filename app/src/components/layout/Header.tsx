import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { mdiAccountCircle, mdiLoginVariant } from '@mdi/js';
import Icon from '@mdi/react';
import headerImageLarge from 'assets/images/gov-bc-logo-horiz.png';
import headerImageSmall from 'assets/images/gov-bc-logo-vert.png';
import { AuthGuard, SystemRoleGuard, UnAuthGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFormattedIdentitySource } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  govHeader: {
    backgroundColor: '#003366'
  },
  govHeaderToolbar: {
    height: '80px',
    '& a:focus': {
      outline: '3px solid #3B99FC'
    }
  },
  brand: {
    display: 'flex',
    flex: '0 0 auto',
    alignItems: 'center',
    color: 'inherit',
    textDecoration: 'none',
    fontSize: '1.25rem',
    fontWeight: 700,
    borderRadius: '2px',
    '& img': {
      verticalAlign: 'middle',
      marginBottom: '4px'
    },
    '& picture': {
      marginRight: '1.5rem'
    },
    '&:hover': {
      textDecoration: 'none'
    },
    '&:focus': {
      outlineOffset: '3px'
    }
  },
  '@media (max-width: 1000px)': {
    brand: {
      fontSize: '14px',
      '& picture': {
        marginRight: '1rem'
      },
      '& span': {
        marginTop: '-4px'
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
    '& hr': {
      backgroundColor: '#ffffff',
      height: '1.25rem'
    },
    '& a': {
      padding: '8px',
      color: 'inherit',
      textDecoration: 'none',
      borderRadius: '6px'
    },
    '& a:hover': {
      textDecoration: 'underline'
    },
    '& a:focus': {
      outlineOffset: '-1px'
    }
  },
  supportButton: {
    color: '#ffffff',
    fontSize: '14px'
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
      textDecoration: 'none',
      borderRadius: '4px'
    },
    '& a:hover': {
      textDecoration: 'underline'
    },
    '& a:focus': {
      outline: '3px solid #3B99FC',
      outlineOffset: '-3px'
    },
    '& a:first-child': {
      marginLeft: theme.spacing(-2)
    }
  }
}));

const Header: React.FC = () => {
  const classes = useStyles();
  // const config = useContext(ConfigContext);

  const { keycloakWrapper } = useContext(AuthStateContext);

  // Authenticated view
  const LoggedInUser = () => {
    const identitySource = keycloakWrapper?.getIdentitySource() || '';
    const userIdentifier = keycloakWrapper?.getUserIdentifier() || '';
    const formattedUsername = [getFormattedIdentitySource(identitySource as SYSTEM_IDENTITY_SOURCE), userIdentifier]
      .filter(Boolean)
      .join('/');

    return (
      <Box display="flex" alignItems="center">
        <Button aria-label="need help" className={classes.supportButton} onClick={showSupportDialog}>
          Contact Support
        </Button>
        <Box display="flex" alignItems="center" my="auto" ml={2} className={classes.userProfile}>
          <Box className={classes.userProfile} display="flex" alignItems="center">
            <Icon path={mdiAccountCircle} size={1.12} />
            <Box ml={1}>{formattedUsername}</Box>
          </Box>
          <Box px={1.5}>
            <Divider orientation="vertical" />
          </Box>
          <RouterLink to="/logout" data-testid="menu_log_out">
            Log Out
          </RouterLink>
        </Box>
      </Box>
    );
  };

  // Unauthenticated public view
  const PublicViewUser = () => {
    return (
      <Box display="flex" className={classes.userProfile} alignItems="center" my="auto">
        <Button className={classes.supportButton} onClick={showSupportDialog}>
          Contact Support
        </Button>
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

  return (
    <>
      <AppBar position="relative" elevation={0} className={classes.govHeader}>
        <Toolbar disableGutters className={classes.govHeaderToolbar}>
          <Container maxWidth="xl">
            <Box display="flex" justifyContent="space-between" width="100%">
              <RouterLink to="/projects" className={classes.brand} aria-label="Go to SIMS Home">
                <picture>
                  <source srcSet={headerImageLarge} media="(min-width: 1200px)"></source>
                  <source srcSet={headerImageSmall} media="(min-width: 600px)"></source>
                  <img src={headerImageSmall} alt={'Government of British Columbia'} />
                </picture>
                <span>
                  Species Inventory Management System
                  <sup className={classes.appPhaseTag}>
                    <BetaLabel />
                  </sup>
                </span>
              </RouterLink>
              <UnAuthGuard>
                <PublicViewUser />
              </UnAuthGuard>
              <AuthGuard>
                <LoggedInUser />
              </AuthGuard>
            </Box>
          </Container>
        </Toolbar>

        <AuthGuard>
          <Box className={classes.mainNav}>
            <Container maxWidth="xl">
              <Toolbar
                variant="dense"
                disableGutters
                className={classes.mainNavToolbar}
                role="navigation"
                aria-label="Main Navigation">
                <RouterLink to="/admin/projects" id="menu_projects">
                  Projects
                </RouterLink>
                <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
                  <RouterLink to="/admin/search" id="menu_search">
                    Map
                  </RouterLink>
                </SystemRoleGuard>
                <RouterLink to="/admin/resources" id="menu_resources">
                  Resources
                </RouterLink>
                <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <RouterLink to="/admin/users" id="menu_admin_users">
                    Manage Users
                  </RouterLink>
                </SystemRoleGuard>
              </Toolbar>
            </Container>
          </Box>
        </AuthGuard>
      </AppBar>

      <Dialog open={open}>
        <DialogTitle>Contact Support</DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="div" color="textSecondary">
            For technical support or questions about this application, please email&nbsp;
            <a href="mailto:biohub@gov.bc.ca?subject=Support Request - Species Inventory Management System">
              {' '}
              biohub@gov.bc.ca
            </a>
            .
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
