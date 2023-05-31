import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import { makeStyles, Theme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import BaseLayout from 'layouts/BaseLayout';
import React from 'react';
import LandingActions from './LandingActions';

const useStyles = makeStyles((theme: Theme) => ({
  baseLayoutContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  heroContainer: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
    color: theme.palette.primary.contrastText,
    background: '#00438A linear-gradient(to bottom, #00438A, #00274D)',
    backgroundImage: `url('/assets/sims-hero-banner.jpg')`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    fontSize: '1.25rem',
    [theme.breakpoints.up('lg')]: {
      fontSize: '1.5rem'
    },
    [theme.breakpoints.up('xl')]: {
      fontSize: '1.75rem'
    }
  },
  heroContainerInner: {
    [theme.breakpoints.up('xs')]: {
      marginRight: 'auto',
      marginLeft: 'auto',
      paddingBottom: theme.spacing(4),
      maxWidth: '80%'
    }
  },
  heroTitle: {
    maxWidth: '19ch',
    fontSize: '2.25em',
    textShadow: '0px 0px 15px rgba(0,13,26,0.5)'
  },
  heroSubtitle: {
    margin: '1.6em 0 2em 0',
    maxWidth: '50ch',
    fontSize: '0.9em',
    textShadow: '0px 0px 10px rgba(0,13,26,1)'
  }
}));

export const LandingPage = () => {
  const classes = useStyles();

  return (
    <BaseLayout className={classes.baseLayoutContainer}>
      <Box className={classes.heroContainer}>
        <Container maxWidth="xl">
          <Box className={classes.heroContainerInner}>
            <Typography variant="h1" className={classes.heroTitle}>
              Species Inventory Management System
            </Typography>
            <Typography className={classes.heroSubtitle}>
              Upload and submit your species inventory project data to help us understand how we can better protect and
              preserve biodiversity in British Columbia.
            </Typography>
            <LandingActions />
          </Box>
        </Container>
      </Box>
    </BaseLayout>
  );
};
