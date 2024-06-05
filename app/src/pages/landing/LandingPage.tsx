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
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
      color: theme.palette.primary.main,
      backgroundImage: `url('/assets/golden-crowned-kinglet-light.jpg')`,
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
      // textShadow: '0px 0px 15px rgba(0,13,26,0.5)'
    },
    heroSubtitle: {
      margin: '1.6em 0 2em 0',
      maxWidth: '50ch',
      fontSize: '0.9em'
      // textShadow: '0px 0px 10px rgba(0,13,26,1)'
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
  const theme = useTheme();
  const classes = useStyles();

  return (
    <BaseLayout>
      <Box
        sx={{
          backgroundImage: `url('/assets/golden-crowned-kinglet-light.jpg')`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          display: 'flex',
          alignItems: 'center',
          height: '50vh',
          paddingTop: theme.spacing(6),
          paddingBottom: theme.spacing(6)
        }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              ...classes.heroContainerInner
            }}>
            <Box
              p="20px 40px"
              width="75%"
              my={4}
              bgcolor="rgba(1, 51, 102, 0.7)"
              sx={{
                borderLeft: `10px solid #fcba19`,
                borderRadius: '4px',
                color: theme.palette.primary.main,
                fontSize: '1.25rem',
                [theme.breakpoints.up('lg')]: {
                  fontSize: '1.5rem'
                },
                [theme.breakpoints.up('xl')]: {
                  fontSize: '1.75rem'
                }
              }}>
              <Typography
                variant="h1"
                color={theme.palette.primary.contrastText}
                sx={{
                  maxWidth: '19ch',
                  fontSize: '2.25em'
                }}>
                Species Inventory Management System
              </Typography>
              <Typography
                color={theme.palette.primary.contrastText}
                sx={{ margin: '1em 0 1.5em 0', maxWidth: '50ch', fontSize: '0.9em' }}>
                Collaboratively manage fish and wildlife data and information to help protect biodiversity in British
                Columbia.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
      <Box sx={classes.introContainer}>
        <Container maxWidth="xl">
          <Box sx={{
              ...classes.heroContainerInner
            }}>
            <LandingActions />
          </Box>
          <Box sx={classes.heroContainerInner}>
            <LandingIntro />
          </Box>
        </Container>
      </Box>
    </BaseLayout>
  );
};
