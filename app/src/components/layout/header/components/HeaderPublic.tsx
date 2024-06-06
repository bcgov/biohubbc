import { mdiLoginVariant } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import { useAuthStateContext } from 'hooks/useAuthStateContext';

/**
 * Header component for unauthenticated (public) users
 * 
 * @returns 
 */
const HeaderPublic = () => {
  const authStateContext = useAuthStateContext();

  return (
    <>
      <Button
        component="a"
        color="inherit"
        variant="text"
        onClick={() => authStateContext.auth.signinRedirect()}
        disableElevation
        startIcon={<Icon path={mdiLoginVariant} size={1} />}
        data-testid="menu_log_in"
        sx={{
          p: 1,
          fontSize: '16px',
          fontWeight: 700,
          textTransform: 'none'
        }}>
        Log In
      </Button>
    </>
  );
};

export default HeaderPublic;
