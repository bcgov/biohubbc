import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import { mdiAccountCircle } from '@mdi/js';
import Icon from '@mdi/react';
import headerImageLarge from 'assets/images/gov-bc-logo-horiz.png';
import headerImageSmall from 'assets/images/gov-bc-logo-vert.png';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { ConfigContext } from 'contexts/configContext';
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { logOut } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  govHeader: {
    borderBottom: '2px solid #fade81'
  },
  govHeaderContainer: {
    paddingLeft: 0,
    paddingRight: 0
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
    fontSize: '1.75rem',
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
      '& picture': {
        marginRight: '1rem'
      }
    }
  },
  usernameAndLogout: {
    color: theme.palette.primary.contrastText,
    fontSize: '1rem',
    '& hr': {
      backgroundColor: theme.palette.primary.contrastText,
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
  mainNav: {
    backgroundColor: '#38598a'
  },
  mainNavContainer: {
    paddingLeft: 0,
    paddingRight: 0
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
  }
}));

const Header: React.FC = () => {
  const classes = useStyles();

  const config = useContext(ConfigContext);

  const location = useLocation();

  const { keycloakWrapper } = useContext(AuthStateContext);

  const LoggedInUser: React.FC = () => {
    if (!keycloakWrapper?.keycloak?.authenticated || !keycloakWrapper?.hasLoadedAllUserInfo) {
      return <></>;
    }

    const loggedInUserDisplayName = `${keycloakWrapper?.getIdentitySource()} / ${keycloakWrapper?.getUserIdentifier()}`.toUpperCase();

    return (
      <Box display="flex" className={classes.usernameAndLogout} my="auto" alignItems="center">
        <Icon path={mdiAccountCircle} size={1.25} />
        <Box ml={1}>{loggedInUserDisplayName}</Box>
        <Box px={2}>
          <Divider orientation="vertical" />
        </Box>
        <Link
          to={location.pathname}
          onClick={() => {
            if (!config) {
              return;
            }

            logOut(config);
          }}
          data-testid="menu_log_out">
          Log Out
        </Link>
      </Box>
    );
  };

  const SecureLink: React.FC<{ to: string; label: string; validRoles: string[]; id: string }> = (props) => {
    if (!keycloakWrapper?.hasSystemRole(props.validRoles)) {
      return <></>;
    }

    return (
      <Link to={props.to} color={'inherit'} id={props.id}>
        {props.label}
      </Link>
    );
  };

  return (
    <AppBar position="sticky" style={{ boxShadow: 'none' }}>
      <Box className={classes.govHeader}>
        <Container maxWidth="xl" className={classes.govHeaderContainer}>
          <Toolbar className={classes.govHeaderToolbar}>
            <Box display="flex" justifyContent="space-between" width="100%">
              <Link to="/projects" className={classes.brand} aria-label="Go to BioHub Home">
                <picture>
                  <source srcSet={headerImageLarge} media="(min-width: 1200px)"></source>
                  <source srcSet={headerImageSmall} media="(min-width: 600px)"></source>
                  <img src={headerImageSmall} alt={'Government of British Columbia'} />
                </picture>
                BioHub
              </Link>
              <LoggedInUser />
            </Box>
          </Toolbar>
        </Container>
      </Box>
      <Box className={classes.mainNav}>
        <Container maxWidth="xl" className={classes.mainNavContainer}>
          <Toolbar variant="dense" className={classes.mainNavToolbar} role="navigation" aria-label="Main Navigation">
            <SecureLink
              to="/projects"
              label="Projects"
              validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_ADMIN]}
              id="menu_projects"
            />
            <SecureLink
              to="/admin/users"
              label="Manage Users"
              validRoles={[SYSTEM_ROLE.SYSTEM_ADMIN]}
              id="menu_admin_users"
            />
          </Toolbar>
        </Container>
      </Box>
    </AppBar>
  );
};

export default Header;
