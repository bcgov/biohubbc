import { mdiMenu } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import useTheme from '@mui/material/styles/useTheme';
import { AuthGuard, SystemRoleGuard, UnAuthGuard } from 'components/security/Guards';
import { SYSTEM_ROLE } from 'constants/roles';
import { SetStateAction, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import HeaderAuthenticated from '../components/HeaderAuthenticated';
import HeaderBrand from '../components/HeaderBrand';
import HeaderPublic from '../components/HeaderPublic';

interface IHeaderResponsiveProps {
  isSupportDialogOpen: boolean;
  setIsSupportDialogOpen: React.Dispatch<SetStateAction<boolean>>;
}

/**
 * Header for mobile view with collapsible menu
 *
 * @returns
 */
const HeaderResponsive = (props: IHeaderResponsiveProps) => {
  const { isSupportDialogOpen, setIsSupportDialogOpen } = props;
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Responsive Menu
  const showMobileMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const hideMobileMenu = () => {
    setAnchorEl(null);
  };
  return (
    <Box
      display={{ sm: 'flex', lg: 'none' }}
      height="100%"
      justifyContent="space-between"
      alignItems="center"
      flex="1 1 auto">
      <Box
        sx={{
          height: '100%',
          '& a': {
            display: 'flex',
            fontSize: '18px',
            fontWeight: '400'
          }
        }}>
        <HeaderBrand />
      </Box>

      <Box>
        <UnAuthGuard>
          <HeaderPublic />
        </UnAuthGuard>
        <Button
          color="inherit"
          startIcon={<Icon path={mdiMenu} size={1.25}></Icon>}
          sx={{
            ml: 2,
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'none'
          }}
          aria-controls={isSupportDialogOpen ? 'mobileMenu' : undefined}
          aria-haspopup="true"
          aria-expanded={isSupportDialogOpen ? 'true' : undefined}
          onClick={showMobileMenu}>
          Menu
        </Button>
        <Menu
          id="mobileMenu"
          anchorEl={anchorEl}
          open={isSupportDialogOpen}
          onClose={hideMobileMenu}
          MenuListProps={{
            'aria-labelledby': 'basic-button'
          }}
          sx={{
            '& a': {
              color: theme.palette.text.primary,
              borderRadius: 0,
              fontWeight: 700,
              textDecoration: 'none',
              outline: 'none'
            },
            '& button': {
              color: theme.palette.text.primary,
              fontWeight: 700
            }
          }}>
          <MenuItem tabIndex={1} component={RouterLink} to="/" id="menu_home_sm">
            Home
          </MenuItem>
          <AuthGuard>
            <MenuItem
              tabIndex={1}
              component={RouterLink}
              to="/admin/projects"
              id="menu_projects_sm"
              onClick={hideMobileMenu}>
              Projects
            </MenuItem>
          </AuthGuard>
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <MenuItem id="menu_admin_users" component={RouterLink} to="/admin/users" onClick={hideMobileMenu}>
              Manage Users
            </MenuItem>
            <MenuItem
              id="menu_admin_funding_sources_sm"
              component={RouterLink}
              to="/admin/funding-sources"
              onClick={hideMobileMenu}>
              Funding Sources
            </MenuItem>
          </SystemRoleGuard>
          <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <MenuItem component={RouterLink} to="/standards" id="menu_standards" onClick={hideMobileMenu}>
              Standards
            </MenuItem>
          </SystemRoleGuard>
          <MenuItem
            component="button"
            onClick={() => {
              setIsSupportDialogOpen(true);
            }}
            sx={{ width: '100%' }}>
            Support
          </MenuItem>
          <AuthGuard>
            <HeaderAuthenticated />
          </AuthGuard>
        </Menu>
      </Box>
    </Box>
  );
};

export default HeaderResponsive;
