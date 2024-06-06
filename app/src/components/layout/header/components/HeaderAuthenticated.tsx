import { mdiHomeVariant, mdiSecurity } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import useTheme from '@mui/material/styles/useTheme';
import { AuthGuard, SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Header component for authenticated (logged in) users
 *
 * @returns
 */
const HeaderAuthenticated = () => {
  const theme = useTheme();

  // const authStateContext = useAuthStateContext();

  // const identitySource = authStateContext.simsUserWrapper.identitySource ?? '';
  // const userIdentifier = authStateContext.simsUserWrapper.userIdentifier ?? '';
  // const formattedUsername = [getFormattedIdentitySource(identitySource as SYSTEM_IDENTITY_SOURCE), userIdentifier]
  //   .filter(Boolean)
  //   .join('/');

  const navButtonSx = {
    '& a': {
      borderRadius: '4px',
      border: `0.5px solid ${theme.palette.primary.dark}`,
      py: 0.5,
      px: 2,
      color: theme.palette.primary.dark,
      fontWeight: 400,
      lineHeight: 1.75,
      textDecoration: 'none'
    }
  };

  return (
    <Stack direction="row" spacing={1}>
      {/* {userIdentifier && (
        <>
          <Box
            display="flex"
            alignItems="center"
            sx={{
              padding: '6px 14px',
              lineHeight: '1.75'
            }}>
            <Icon path={mdiAccountCircle} size={1} />
            <Box ml={1}>{formattedUsername}</Box>
          </Box>
          <Divider
            orientation="vertical"
            sx={{
              marginRight: '6px',
              height: '20px',
              borderColor: '#fff'
            }}
          />
        </>
      )} */}
      <Box sx={navButtonSx}>
        <AuthGuard>
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <RouterLink
              to="/admin/admin-dashboard"
              id="menu_projects"
              style={{ display: 'flex', alignItems: 'center' }}>
              <Box mt={0.5} component="span" sx={{ mr: 0.8 }}>
                <Icon path={mdiSecurity} size={0.8} />
              </Box>
              Admin
            </RouterLink>
          </SystemRoleGuard>
        </AuthGuard>
      </Box>
      <Box sx={navButtonSx}>
        <AuthGuard>
          <RouterLink to="/admin/projects" id="menu_projects" style={{ display: 'flex', alignItems: 'center' }}>
            <Box mt={0.5} component="span" sx={{ mr: 0.8 }}>
              <Icon path={mdiHomeVariant} size={0.8} />
            </Box>
            Dashboard
          </RouterLink>
        </AuthGuard>
      </Box>
    </Stack>
  );
};

export default HeaderAuthenticated;

{
  /* <Box
        display="flex"
        alignItems="center"
        sx={{
          padding: '6px 14px',
          lineHeight: '1.75'
        }}>
        <Icon path={mdiAccountCircle} size={1} />
        <Box ml={1}>{formattedUsername}</Box>
      </Box>
      <Divider
        orientation="vertical"
        sx={{
          marginRight: '6px',
          height: '20px',
          borderColor: '#fff'
        }}
      /> */
}
{
  /* <Button
        component="a"
        variant="text"
        onClick={() => authStateContext.auth.signoutRedirect()}
        data-testid="menu_log_out"
        sx={{ color: theme.palette.primary.main, fontSize: '16px', textTransform: 'none' }}>
        Log out
      </Button> */
}
