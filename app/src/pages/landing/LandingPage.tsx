import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import BaseLayout from 'layouts/BaseLayout';
import LandingActionButton from './components/LandingActionButton';
import LandingActions from './LandingActions';

export const LandingPage = () => {
  const theme = useTheme();

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
          paddingTop: theme.spacing(10),
          paddingBottom: theme.spacing(10)
        }}>
        <Container maxWidth="lg">
          <Box
            p="20px 40px"
            width="70ch"
            bgcolor="rgba(1, 51, 102, 0.8)"
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
              sx={{ margin: '1em 0 1.5em 0', maxWidth: '55ch', fontSize: '0.8em' }}>
              Collaboratively manage fish and wildlife data and information to help protect biodiversity in British
              Columbia.
            </Typography>
            <LandingActionButton />
          </Box>
        </Container>
      </Box>
      <Container maxWidth="lg">
        <LandingActions />
      </Container>
    </BaseLayout>
  );
};
