import { mdiAccountCircle, mdiLoginVariant } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import headerImageLarge from 'assets/images/gov-bc-logo-horiz.png';
import headerImageSmall from 'assets/images/gov-bc-logo-vert.png';
import { AuthGuard, SystemRoleGuard, UnAuthGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import React, { useContext, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFormattedIdentitySource } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  govHeaderToolbar: {
    height: '80px',
    '& button': {
      padding: '6px 14px',
      fontWeight: '400'
    },
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
    }
  },
  mainNavToolbar: {
    '& a': {
      display: 'block',
      padding: theme.spacing(2),
      color: 'inherit',
      fontSize: '1rem',
      textDecoration: 'none',
    },
    '& a:hover': {
      textDecoration: 'underline'
    },
    '& a:focus': {
      outline: '3px solid #3B99FC',
      outlineOffset: '-3px'
    },
    '& a:first-child': {
      marginLeft: '-16px'
    }
  }
}));

const Header: React.FC = () => {
  const classes = useStyles();
  const { keycloakWrapper } = useContext(AuthStateContext);
  const loginUrl = useMemo(() => keycloakWrapper?.getLoginUrl(), [keycloakWrapper]);

  // Authenticated view
  const LoggedInUser = () => {
    const identitySource = keycloakWrapper?.getIdentitySource() || '';
    const userIdentifier = keycloakWrapper?.getUserIdentifier() || '';
    const formattedUsername = [getFormattedIdentitySource(identitySource as SYSTEM_IDENTITY_SOURCE), userIdentifier]
      .filter(Boolean)
      .join('/');

    return (
      <Box display="flex" alignItems="center"
        sx={{
          fontSize: '14px',
        }}
      >
        <Box display="flex" alignItems="center"
          sx={{
            padding: '6px 14px',
            lineHeight: '1.75'
          }}
        >
          <Icon path={mdiAccountCircle} size={1} />
          <Box ml={1}>{formattedUsername}</Box>
        </Box>
        <Divider orientation="vertical"
          sx={{
            marginRight: '4px',
            marginLeft: '4px',
            height: '20px',
            borderColor: '#fff'
          }}
        />
        <Button
          component="a"
          color="primary"
          variant="contained"
          href="/logout"
          data-testid="menu_log_out"
          sx={{
            fontWeight: '400'
          }}
        >
          Log Out
        </Button>
      </Box>
    );
  };

  // Unauthenticated public view
  const PublicViewUser = () => {
    return (
      <Button
        component="a"
        color="primary"
        variant="contained"
        href={loginUrl}
        disableElevation
        startIcon={<Icon path={mdiLoginVariant} size={1} />}
        data-testid="login"
        sx={{
          fontWeight: '400'
        }}>
        Log In
      </Button>
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
      <AppBar position="relative" elevation={0}
        sx={{
          backgroundColor: '#003366'
        }}
      >
        <Toolbar disableGutters className={classes.govHeaderToolbar}>
          <Container maxWidth="xl">
            <Box display="flex" justifyContent="space-between" width="100%">
              <RouterLink to="/" className={classes.brand} aria-label="Go to SIMS Home">
                <picture>
                  <source srcSet={headerImageLarge} media="(min-width: 1200px)"></source>
                  <source srcSet={headerImageSmall} media="(min-width: 600px)"></source>
                  <img src={headerImageSmall} alt={'Government of British Columbia'} />
                </picture>
                <span>
                  Species Inventory Management System
                  <Box component="sup"
                    sx={{
                      marginLeft: '4px',
                      color: '#fcba19',
                      fontSize: '0.75rem',
                      fontWeight: 400,
                      textTransform: 'uppercase',
                    }}
                  >
                    <BetaLabel />
                  </Box>
                </span>
              </RouterLink>
              <Box display="flex" alignItems="center">
                <Button
                  color="primary"
                  variant="contained"
                  disableElevation
                  onClick={showSupportDialog}
                  sx={{
                    marginRight: '8px'
                  }}>
                  Contact Support
                </Button>
                <UnAuthGuard>
                  <PublicViewUser />
                </UnAuthGuard>
                <AuthGuard>
                  <LoggedInUser />
                </AuthGuard>
              </Box>
            </Box>
          </Container>
        </Toolbar>

        <Box
          sx={{
            backgroundColor: '#38598a'
          }}
        >
          <Container maxWidth="xl">
            <Toolbar
              variant="dense"
              disableGutters
              className={classes.mainNavToolbar}
              role="navigation"
              aria-label="Main Navigation">
              <UnAuthGuard>
                <RouterLink to="/" id="menu_home">
                  Home
                </RouterLink>
              </UnAuthGuard>
              <AuthGuard>
                <RouterLink to="/admin/projects" id="menu_projects">
                  Projects
                </RouterLink>
              </AuthGuard>
              <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]}>
                <RouterLink to="/admin/search" id="menu_search">
                  Map
                </RouterLink>
              </SystemRoleGuard>
              <RouterLink to="/resources" id="menu_resources">
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
      </AppBar>

      <Dialog open={open}>
        <DialogTitle>Contact Support</DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="div" color="textSecondary">
            For technical support or questions about this application, please email &zwnj;
            <a href="mailto:biohub@gov.bc.ca?subject=Support Request - Species Inventory Management System">
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
