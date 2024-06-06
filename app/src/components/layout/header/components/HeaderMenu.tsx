import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import useTheme from '@mui/material/styles/useTheme';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { SetStateAction } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface IHeaderMenuProps {
  setIsHeaderMenuOpen: React.Dispatch<SetStateAction<boolean>>;
}

/**
 * Admin header for desktop (large screens) view
 *
 * @returns
 */
const HeaderMenu = (props: IHeaderMenuProps) => {
  const theme = useTheme();

  const authStateContext = useAuthStateContext();

  return (
    <Box display="flex" justifyContent="space-between" bgcolor={grey[50]}>
      <Box
        py={1}
        display="flex"
        alignItems="center"
        mx={3}
        sx={{
          '& a': {
            padding: 1,
            color: theme.palette.text.primary,
            fontWeight: 700,
            lineHeight: 1.75,
            textDecoration: 'none',
            marginLeft: 1
          },
          '& a:first-of-type': {
            marginLeft: 0
          },
          '& button': {
            fontSize: '16px',
            fontWeight: 400,
            textTransform: 'none'
          }
        }}>
        <RouterLink
          to="/admin/funding-sources"
          id="menu_admin_funding_sources"
          onClick={() => {
            props.setIsHeaderMenuOpen(false);
          }}>
          Data Standards
        </RouterLink>
      </Box>
      <Box display="flex" alignItems="center">
        <Box>
          <Button
            variant="text"
            sx={{ fontWeight: 700 }}
            onClick={() => {
              authStateContext.auth.signoutRedirect();
              props.setIsHeaderMenuOpen(false);
            }}>
            Log out
          </Button>
        </Box>
        <Box p={2}>
          <IconButton
            onClick={() => {
              props.setIsHeaderMenuOpen(false);
            }}
            color="primary"
            aria-label="close admin navigation bar">
            <Icon path={mdiClose} size={1} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default HeaderMenu;
