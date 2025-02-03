import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import BaseLayout from 'layouts/BaseLayout';
import LandingActions from './LandingActions';
import { LandingIntro } from './LandingIntro';

const useStyles = () => {
  const theme = useTheme();

  return {
    heroContainer: {
      display: 'flex',
      alignItems: 'center',
      height: '80vh',
      position: 'relative',
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
      color: theme.palette.primary.contrastText,
      background: '#00438A linear-gradient(to bottom, #00438A, #00274D)',
      backgroundImage: `url('/assets/mountain-goats.jpg')`,
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
      fontSize: '2.5em'
    },
    heroSubtitle: {
      margin: '1.6em 0 2em 0',
      maxWidth: '50ch',
      fontSize: '0.8em'
    },
    introContainer: {
      display: 'flex',
      alignItems: 'center',
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
      fontSize: '1.25rem',
      [theme.breakpoints.up('lg')]: {
        fontSize: '1.5rem'
      },
      [theme.breakpoints.up('xl')]: {
        fontSize: '1.75rem'
      }
    }
  };
};

export const LandingPage = () => {
  const classes = useStyles();

  return (
    <BaseLayout>
      <Box sx={classes.heroContainer}>
        <Container maxWidth="xl">
          <Box sx={classes.heroContainerInner}>
            <Typography variant="h1" sx={classes.heroTitle} color="primary">
              Species Inventory Management System
            </Typography>
            <Typography sx={classes.heroSubtitle} color="primary">
              Collaboratively manage fish and wildlife data and information to help protect biodiversity in British
              Columbia.
            </Typography>
            <LandingActions />
          </Box>
        </Container>
        <Typography position="absolute" sx={{ right: '16px', bottom: '16px' }} aria-label="Photo by Shane White">
          Photo: Shane White
        </Typography>
      </Box>
      <Box sx={classes.introContainer}>
        <Container maxWidth="xl">
          <Box sx={classes.heroContainerInner}>
            <LandingIntro />
          </Box>
        </Container>
      </Box>
    </BaseLayout>
  );
};
