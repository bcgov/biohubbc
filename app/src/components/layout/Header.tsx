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
import Link from '@material-ui/core/Link';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { mdiAccountCircle, mdiHelpCircleOutline, mdiLoginVariant } from '@mdi/js';
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
    height: '80px'
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
    fontSize: '1rem',
    '& hr': {
      backgroundColor: '#ffffff',
      height: '1.25rem'
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
      <Box display="flex" className={classes.userProfile} my="auto" alignItems="center">
        <IconButton aria-label="need help" className={classes.govHeaderIconButton} onClick={showSupportDialog}>
          <Icon path={mdiHelpCircleOutline} size={1.12} />
        </IconButton>
        <Box className={classes.userProfile} display="flex" alignItems="center" ml={2}>
          <Icon path={mdiAccountCircle} size={1.12} />
          <Box ml={1}>{formattedUsername}</Box>
        </Box>
        <Box px={2}>
          <Divider orientation="vertical" />
        </Box>
        <RouterLink to="/logout" data-testid="menu_log_out">
          Log Out
        </RouterLink>
      </Box>
    );
  };

  // Unauthenticated public view
  const PublicViewUser = () => {
    return (
      <Box display="flex" className={classes.userProfile} alignItems="center" my="auto">
        <IconButton className={classes.govHeaderIconButton} onClick={showSupportDialog}>
          <Icon path={mdiHelpCircleOutline} size={1.12} />
        </IconButton>
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
                <RouterLink to="/admin/search" id="menu_search">
                  Map
                </RouterLink>
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
        <DialogTitle>Need Help?</DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="div" color="textSecondary" gutterBottom>
            For technical support or questions about this application, please contact:&nbsp;
            <Link
              component={RouterLink}
              to="mailto:biohub@gov.bc.ca?subject=BioHub - Secure Document Access Request"
              underline="always">
              biohub@gov.bc.ca
            </Link>
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
