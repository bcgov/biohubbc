import Container from '@material-ui/core/Container';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import BaseLayout from 'layouts/BaseLayout';
import React from 'react';
import LandingActions from './LandingActions';

const useStyles = makeStyles((theme: Theme) => ({
  baseLayoutContainer: {
    // Contingency background, pending hero image load
    background: '#00438A linear-gradient(to bottom, #00438A, #00274D)',
    backgroundImage: `url('/assets/hero.jpg')`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    color: theme.palette.primary.contrastText,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '30rem',

    '& > main': {
      display: 'flex',
      marginTop: theme.spacing(-6)
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
    margin: '2rem 0 4rem',
    fontSize: '1.325rem',
    lineHeight: '1.5',
    textShadow: '0px 0px 10px rgba(0,13,26,1)'
  }
}));

export const LandingPage = () => {
  const classes = useStyles();

  return (
    <BaseLayout className={classes.baseLayoutContainer}>
      <Container maxWidth="md">
        <Typography variant="h1" className={classes.heroHeader}>
          Species Inventory Management System
        </Typography>
        <Typography variant="body1" className={classes.heroSubheader}>
          Upload and submit your species inventory project data to help understand how we can better protect and
          preserve biodiversity in British Columbia.
        </Typography>
        <LandingActions />
      </Container>
    </BaseLayout>
  );
};
