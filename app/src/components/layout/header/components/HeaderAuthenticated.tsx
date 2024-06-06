import { mdiAccountCircle, mdiDotsVertical, mdiHomeVariant, mdiLogout, mdiSecurity } from '@mdi/js';
import Icon from '@mdi/react';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import useTheme from '@mui/material/styles/useTheme';
import { AuthGuard, SystemRoleGuard } from 'components/security/Guards';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { AdministrativeActivityStatusType, AdministrativeActivityType } from 'constants/misc';
import { SYSTEM_ROLE } from 'constants/roles';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { SetStateAction, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFormattedIdentitySource } from 'utils/Utils';

interface IHeaderAuthenticatedProps {
  setIsAdminHeaderOpen: React.Dispatch<SetStateAction<boolean>>;
  setIsHeaderMenuOpen: React.Dispatch<SetStateAction<boolean>>;
}
/**
 * Header component for authenticated (logged in) users
 *
 * @returns
 */
const HeaderAuthenticated = (props: IHeaderAuthenticatedProps) => {
  const theme = useTheme();

  const authStateContext = useAuthStateContext();
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);

  const biohubApi = useBiohubApi();

  const accessRequestsDataLoader = useDataLoader(() =>
    biohubApi.admin.getAdministrativeActivities(
      [AdministrativeActivityType.SYSTEM_ACCESS],
      [AdministrativeActivityStatusType.PENDING, AdministrativeActivityStatusType.REJECTED]
    )
  );

  useEffect(() => {
    accessRequestsDataLoader.load();
  }, []);

  const identitySource = authStateContext.simsUserWrapper.identitySource ?? '';
  const userIdentifier = authStateContext.simsUserWrapper.userIdentifier ?? '';
  const formattedUsername = [getFormattedIdentitySource(identitySource as SYSTEM_IDENTITY_SOURCE), userIdentifier]
    .filter(Boolean)
    .join('/');

  const navButtonSx = {
    display: 'flex',
    alignItems: 'center',
    '& a': {
      borderRadius: '4px',
      border: `0.3px solid ${theme.palette.primary.light}`,
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
      {userIdentifier && (
        <>
          <Box
            display="flex"
            alignItems="center"
            color={theme.palette.primary.main}
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
      )}
      <Box sx={navButtonSx}>
        <AuthGuard>
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button
              variant="outlined"
              onClick={() => {
                props.setIsAdminHeaderOpen((isAdminHeaderOpen) => !isAdminHeaderOpen);
                props.setIsHeaderMenuOpen(false);

                // Check for new user requests
                accessRequestsDataLoader.refresh();
              }}
              sx={{ display: 'flex', alignItems: 'center' }}>
              <Box mt={0.5} component="span" sx={{ mr: 0.8 }} position="relative">
                <Icon path={mdiSecurity} size={0.8} />
                {accessRequestsDataLoader.data && (
                  <Badge
                    variant="dot"
                    badgeContent={accessRequestsDataLoader.data.length}
                    color="error"
                    sx={{ mt: 0.4, ml: -0.25, position: 'absolute' }}
                  />
                )}
              </Box>
              Admin
            </Button>
          </SystemRoleGuard>
        </AuthGuard>
      </Box>
      <AuthGuard>
        <Button
          variant="contained"
          component={RouterLink}
          to="/admin/projects"
          startIcon={<Icon path={mdiHomeVariant} size={0.8} />}>
          Dashboard
        </Button>
      </AuthGuard>
      <AuthGuard>
        <Button
          variant="outlined"
          sx={navButtonSx}
          startIcon={<Icon path={mdiDotsVertical} size={1} />}
          onClick={() => {
            props.setIsAdminHeaderOpen(false);
            props.setIsHeaderMenuOpen((isHeaderMenuOpen) => !isHeaderMenuOpen);
          }}>
          Menu
        </Button>
      </AuthGuard>

      <Menu
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        sx={{
          '& .MuiPaper-root': {
            mt: 5
          }
        }}>
        <MenuItem onClick={() => authStateContext.auth.signoutRedirect()}>
          <ListItemIcon>
            <Icon path={mdiLogout} size={1} />
          </ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
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
