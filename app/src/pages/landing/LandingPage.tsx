import React, { useContext } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
//import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { AuthStateContext } from 'contexts/authStateContext';
import { makeStyles, Theme } from '@material-ui/core/styles';
import BaseLayout from 'layouts/BaseLayout';
interface ILandingPageProps {
  originalPath: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  baseLayoutContainer: {
    color: 'white',
    backgroundColor: 'blue',
    minHeight: '100vh',
    background: `url('/assets/hero.jpg')`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundZize: 'cover',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '30rem',
    '& > main': {
      display: 'flex'
    }
  },
  heroHeader: {
    // mt: -4,
    fontSize: '3rem',
    letterSpacing: '-0.03rem'
  },
  heroSubheader: {
    marginTop: '3rem',
    marginBottom: '6rem',
    maxWidth: '45ch',
    fontSize: '1.25rem',
    lineHeight: '1.5'
  },
  heroButton: {
    color: '#003366',
    fontWeight: 700,
    backgroundColor: '#fcba19'
  },
  actionsContainer: {
    maxWidth: '45ch',
  }
}));

export const LandingPage: React.FC<ILandingPageProps> = ({ originalPath }) => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const classes = useStyles();

  const handleLogin = () => {
    keycloakWrapper?.keycloak?.login();
  }
  

  return (
    <BaseLayout className={classes.baseLayoutContainer}>
      <Container maxWidth="sm" className={''}>
        <Typography variant="h1" className={classes.heroHeader}>
          Species Inventory Management System
        </Typography>
        <Typography variant="body1" className={classes.heroSubheader}>
          Upload and submit your species inventory project data to help understand how we can better protect and preserve biodiversity in British Columbia.
        </Typography>
        <Box className={classes.actionsContainer}>
          <p>
            To access this application, you must use a valid BC government-issued IDIR or BCeID account credentia
          </p>
          <Button onClick={() => handleLogin()} variant='contained' className={classes.heroButton} size='large'>Log In</Button>
          <p>Don't have an account? <a href='/'>Register here.</a></p>
        </Box>
      </Container>
    </BaseLayout>
  );
};
