import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Toolbar from '@material-ui/core/Toolbar';
import headerImageLarge from 'assets/images/gov-bc-logo-horiz.png';
import headerImageSmall from 'assets/images/gov-bc-logo-vert.png';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

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

  const { keycloakWrapper } = useContext(AuthStateContext);

  return (
    <AppBar position="sticky" style={{ boxShadow: 'none' }}>
      <Box className={classes.govHeader}>
        <Container maxWidth="xl" className={classes.govHeaderContainer}>
          <Toolbar className={classes.govHeaderToolbar}>
            <Link to="/projects" className={classes.brand} aria-label="Go to BioHub Home">
              <picture>
                <source srcSet={headerImageLarge} media="(min-width: 1200px)"></source>
                <source srcSet={headerImageSmall} media="(min-width: 600px)"></source>
                <img src={headerImageSmall} alt={'Government of British Columbia'} />
              </picture>
              BioHub
            </Link>
          </Toolbar>
        </Container>
      </Box>
      <Box className={classes.mainNav}>
        <Container maxWidth="xl" className={classes.mainNavContainer}>
          <Toolbar variant="dense" className={classes.mainNavToolbar} role="navigation" aria-label="Main Navigation">
            <Link to="/projects" color={'inherit'}>
              Projects
            </Link>
            {keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.SYSTEM_ADMIN]) && (
              <Link to="/admin/users" color={'inherit'}>
                Manage Users
              </Link>
            )}
          </Toolbar>
        </Container>
      </Box>
    </AppBar>
  );
};

export default Header;
