import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import BaseLayout from 'layouts/BaseLayout';
import LandingActions from './LandingActions';

const useStyles = makeStyles((theme: Theme) => ({
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
    maxWidth: '55ch',
    fontSize: '0.9em',
    textShadow: '0px 0px 10px rgba(0,13,26,1)'
  }
}));

export const LandingPage = () => {
  const classes = useStyles();

  return (
    <BaseLayout>
      <Box className={classes.heroContainer}>
        <Container maxWidth="xl">
          <Box className={classes.heroContainerInner}>
            <Typography variant="h1" className={classes.heroTitle}>
              Species Inventory Management System
            </Typography>
            <Typography className={classes.heroSubtitle}>
              Collaboratively manage and submit species inventory data and information to help protect biodiversity in
              British Columbia.
            </Typography>
            <LandingActions />
          </Box>
        </Container>
      </Box>
    </BaseLayout>
  );
};
