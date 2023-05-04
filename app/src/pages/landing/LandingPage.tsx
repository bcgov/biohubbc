import Box from '@material-ui/core/Box';
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
    backgroundImage: `url('/assets/sims-hero-banner.jpg')`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    color: theme.palette.primary.contrastText,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '30em',

    '& > main': {
      display: 'flex',
      marginTop: theme.spacing(-6)
    }
  },
  heroContainer: {
    fontSize: '1em',

    [theme.breakpoints.up('xl')]: {
      fontSize: '1.5em'
    }
  },
  heroContentBox: {
    maxWidth: '50em',
    margin: '0 auto'
  },
  heroHeader: {
    fontSize: '3.5em',
    letterSpacing: '-0.03em',
    textShadow: '0px 0px 15px rgba(0,13,26,0.5)'
  },
  heroSubheader: {
    margin: '2em 0',
    fontSize: '1.5em',
    lineHeight: '1.5',
    textShadow: '0px 0px 10px rgba(0,13,26,1)'
  }
}));

export const LandingPage = () => {
  const classes = useStyles();

  return (
    <BaseLayout className={classes.baseLayoutContainer}>
      <Container className={classes.heroContainer}>
        <Box className={classes.heroContentBox}>
          <Typography variant="h1" className={classes.heroHeader}>
            Species Inventory Management System
          </Typography>
          <Typography variant="body1" className={classes.heroSubheader}>
            Upload and submit your species inventory project data to help understand how we can better protect and
            preserve biodiversity in British Columbia.
          </Typography>
          <LandingActions />
        </Box>
      </Container>
    </BaseLayout>
  );
};
