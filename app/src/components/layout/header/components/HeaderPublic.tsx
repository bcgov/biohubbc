import { mdiAccountCircle } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { UnAuthGuard } from 'components/security/Guards';
import { useAuthStateContext } from 'hooks/useAuthStateContext';

/**
 * Header component for unauthenticated (public) users
 *
 * @returns
 */
const HeaderPublic = () => {
  const authStateContext = useAuthStateContext();

  return (
    <Stack direction="row" spacing={1}>
      <UnAuthGuard>
        <Button
          component="a"
          variant="contained"
          onClick={() => authStateContext.auth.signinRedirect()}
          disableElevation
          startIcon={<Icon path={mdiAccountCircle} size={1} />}
          data-testid="menu_log_in"
          sx={{
            p: 1,
            px: 3,
            fontSize: '16px',
            fontWeight: 300,
            textTransform: 'none'
          }}>
          Log In
        </Button>
      </UnAuthGuard>
    </Stack>
  );
};

export default HeaderPublic;
