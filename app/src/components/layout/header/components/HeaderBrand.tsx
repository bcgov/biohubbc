import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import headerImageLarge from 'assets/images/gov-bc-logo-horiz-inverse.png';
import { Link as RouterLink } from 'react-router-dom';

/**
 * BC Government branding for the header of the app layout
 *
 * @returns
 */
const HeaderBrand = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: '100%',
        '& a': {
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          fontSize: { xs: '16px', lg: '18px' },
          fontWeight: '700',
          textDecoration: 'none',
          color: theme.palette.primary.main
        },
        '& img': {
          mr: 2,
          height: '55px'
        }
      }}>
      <RouterLink to="/" aria-label="Go to SIMS Home">
        <Box component="img" src={headerImageLarge} />
        <span>
          Species Inventory Management System
          <Box
            component="sup"
            sx={{
              marginLeft: '4px',
              color: '#fcba19',
              fontSize: '0.75rem',
              fontWeight: 400,
              textTransform: 'uppercase'
            }}>
            {/* BETA label */}
            <span aria-label="This application is currently in beta phase of development">Beta</span>
          </Box>
        </span>
      </RouterLink>
    </Box>
  );
};

export default HeaderBrand;
