import React, { useContext, useMemo } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { AuthStateContext } from 'contexts/authStateContext';
import BaseLayout from 'layouts/BaseLayout';

const useStyles = makeStyles((theme: Theme) => ({
  baseLayoutContainer: {  
    backgroundImage: `url('/assets/hero.jpg')`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    
    // Contingency background-color pending hero image load
    background: '#00438A linear-gradient(to bottom, #00438A, #00274D)',
    // backgroundColor: '', 
    
    color: theme.palette.primary.contrastText,
    minHeight: '100vh',
    
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '30rem',
    '& > main': {
      display: 'flex'
    }
  },
  heroHeader: {
    maxWidth: '22ch',
    fontSize: '3.5rem',
    letterSpacing: '-0.03rem',
    textShadow: '0px 0px 15px rgba(0,13,26,0.5)'
  },
  heroSubheader: {
    maxWidth: '45ch',
    marginTop: '3rem',
    marginBottom: '3rem',
    fontSize: '1.325rem',
    lineHeight: '1.5',
    textShadow: '0px 0px 10px rgba(0,13,26,1)'
  },
  heroButton: {
    textTransform: 'uppercase',
    color: theme.palette.primary.main,
    fontWeight: 700,
    backgroundColor: '#fcba19',
    padding: '12px 44px'
  },
  actionsContainer: {
    maxWidth: '45ch',
    '& p': {
      margin: '1.5rem 0'
    }
  },
  heroLink: {
    color: '#fcba19',
    fontWeight: 700,
    textDecoration: 'none'
  }
}));

export const LandingPage = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const classes = useStyles();

  const loginUrl = useMemo(() => keycloakWrapper?.keycloak?.createLoginUrl() || '/login', []);

  return (
    <BaseLayout className={classes.baseLayoutContainer}>
      <Container maxWidth="md" className={''}>
        <Typography variant="h1" className={classes.heroHeader}>
          Species Inventory Management System
        </Typography>
        <Typography variant="body1" className={classes.heroSubheader}>
          Upload and submit your species inventory project data to help understand how we can better protect and preserve biodiversity in British Columbia.
        </Typography>
        <Box className={classes.actionsContainer}>
          <p>
            To access this application, you must use a valid BC government-issued IDIR or BCeID account credential.
          </p>
          <Button
            component='a'
            href={loginUrl}
            variant='contained'
            className={classes.heroButton}
            size='large'
          >
            Log In
          </Button>
          <p>Don't have an account? <a className={classes.heroLink} href='/'>Register here.</a></p>
        </Box>
      </Container>
    </BaseLayout>
  );
};
