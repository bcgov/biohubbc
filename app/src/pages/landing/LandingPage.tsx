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
    backgroundPosition: '',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '30rem'
  },
  heroHeader: {
    mt: -4,
    fontSize: '3rem',
    letterSpacing: '-0.03rem'
  },
  heroSubheader: {
    mt: 3,
    mb: 6,
    maxWidth: '45ch',
    fontSize: '1.75rem',
    lineHeight: '1.25'
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
      <Container maxWidth="md" className={''}>
        <Typography variant="h1" className={classes.heroHeader}>
          Species Inventory Management System
        </Typography>
        <Typography
          variant="body1"
          color="textSecondary"
          className={classes.heroSubheader}
        >
          Upload and submit your species inventory project data to help understand how we can better protect and preserve biodiversity in British Columbia.
        </Typography>
        <Box>
          <p>
            To access this application, you must use a valid BC government-issued IDIR or BCeID account credentia
          </p>
          <Button onClick={() => handleLogin()} color='secondary' size='large'>Log In</Button>
          <p>Don't have an account? <a href='/'>Register here.</a></p>
        </Box>
      </Container>
    </BaseLayout>
  );
};
