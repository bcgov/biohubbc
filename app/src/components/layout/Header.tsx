import { mdiAccountCircle, mdiLoginVariant, mdiMenu } from '@mdi/js';
import Icon from '@mdi/react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import headerImageLarge from 'assets/images/gov-bc-logo-horiz.png';
import headerImageSmall from 'assets/images/gov-bc-logo-vert.png';
import { AuthGuard, SystemRoleGuard, UnAuthGuard } from 'components/security/Guards';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { SYSTEM_ROLE } from 'constants/roles';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getFormattedIdentitySource } from 'utils/Utils';

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const [open, setOpen] = React.useState(false);
  const menuOpen = Boolean(anchorEl);

  // Support Dialog
  const showSupportDialog = () => {
    setOpen(true);
    hideMobileMenu();
  };

  const hideSupportDialog = () => {
    setOpen(false);
  };

  // Responsive Menu
  const showMobileMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const hideMobileMenu = () => {
    setAnchorEl(null);
  };

  const BetaLabel = () => {
    return <span aria-label="This application is currently in beta phase of development">Beta</span>;
  };

  // Authenticated view
  const LoggedInUser = () => {
    const authStateContext = useAuthStateContext();

    const identitySource = authStateContext.simsUserWrapper.identitySource ?? '';
    const userIdentifier = authStateContext.simsUserWrapper.userIdentifier ?? '';
    const formattedUsername = [getFormattedIdentitySource(identitySource as SYSTEM_IDENTITY_SOURCE), userIdentifier]
      .filter(Boolean)
      .join('/');

    return (
      <>
        <Box
          display={{ xs: 'none', lg: 'flex' }}
          alignItems="center"
          sx={{
            fontSize: '16px',
            fontWeight: 700
          }}>
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
          <Button
            component="a"
            variant="text"
            onClick={() => authStateContext.auth.signoutRedirect()}
            data-testid="menu_log_out"
            sx={{
              color: 'inherit',
              fontSize: '16px',
              fontWeight: 700,
              textTransform: 'none'
            }}>
            Log Out
          </Button>
        </Box>
        <MenuItem
          component="a"
          color="#1a5a96"
          onClick={() => authStateContext.auth.signoutRedirect()}
          data-testid="collapsed_menu_log_out"
          sx={{
            display: { xs: 'block', lg: 'none' }
          }}>
          Log out
        </MenuItem>
      </>
    );
  };

  // Unauthenticated public view
  const PublicViewUser = () => {
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

  // Unauthenticated public view
  const AppBrand = () => {
    return (
      <Box
        sx={{
          '& a': {
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            color: '#fff',
            fontSize: { xs: '16px', lg: '18px' },
            fontWeight: '400',
            textDecoration: 'none'
          },
          '& img': {
            mr: 2
          }
        }}>
        <RouterLink to="/" aria-label="Go to SIMS Home">
          <picture>
            <source srcSet={headerImageLarge} media="(min-width: 960px)"></source>
            <source srcSet={headerImageSmall} media="(min-width: 600px)"></source>
            <img src={headerImageSmall} alt={'Government of British Columbia'} />
          </picture>
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
              <BetaLabel />
            </Box>
          </span>
        </RouterLink>
      </Box>
    );
  };

  return (
    <>
      <AppBar
        position="relative"
        elevation={0}
        sx={{
          fontFamily: 'BCSans, Verdana, Arial, sans-serif',
          backgroundColor: '#003366',
          borderBottom: '3px solid #fcba19'
        }}>
        <Toolbar
          sx={{
            height: 70
          }}>
          {/* Responsive Menu */}
          <Box display={{ sm: 'flex', lg: 'none' }} justifyContent="space-between" alignItems="center" flex="1 1 auto">
            <Box
              sx={{
                '& a': {
                  display: 'flex',
                  color: '#fff',
                  fontSize: '18px',
                  fontWeight: '400'
                }
              }}>
              <AppBrand></AppBrand>
            </Box>

            <Box>
              <UnAuthGuard>
                <PublicViewUser />
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
                aria-controls={menuOpen ? 'mobileMenu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
                onClick={showMobileMenu}>
                Menu
              </Button>
              <Menu
                id="mobileMenu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={hideMobileMenu}
                MenuListProps={{
                  'aria-labelledby': 'basic-button'
                }}
                sx={{
                  '& a': {
                    color: '#1a5a96',
                    borderRadius: 0,
                    fontWeight: 700,
                    textDecoration: 'none',
                    outline: 'none'
                  },
                  '& button': {
                    color: '#1a5a96',
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
                    to="/admin/summary"
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
                <MenuItem component={RouterLink} to="/standards" id="menu_standards" onClick={hideMobileMenu}>
                  Standards
                </MenuItem>
                <MenuItem component="button" onClick={showSupportDialog} sx={{ width: '100%' }}>
                  Support
                </MenuItem>
                <AuthGuard>
                  <LoggedInUser />
                </AuthGuard>
              </Menu>
            </Box>
          </Box>

          {/* Desktop Menu */}
          <Box
            display={{ xs: 'none', lg: 'flex' }}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%">
            <Box display="flex" flexDirection="row" alignItems="center">
              <Box
                sx={{
                  '& a': {
                    display: 'flex',
                    alignItems: 'center',
                    color: '#fff',
                    fontSize: '18px',
                    fontWeight: '400',
                    textDecoration: 'none'
                  }
                }}>
                <AppBrand></AppBrand>
              </Box>
              <Box
                ml={8}
                display="flex"
                alignItems="center"
                sx={{
                  '& a': {
                    p: 1,
                    color: 'inherit',
                    fontWeight: 700,
                    lineHeight: 1.75,
                    textDecoration: 'none'
                  },
                  '& a + a': {
                    ml: 1
                  },
                  '& button': {
                    fontSize: '16px',
                    fontWeight: 700,
                    textTransform: 'none'
                  }
                }}>
                <UnAuthGuard>
                  <RouterLink to="/" id="menu_home">
                    Home
                  </RouterLink>
                </UnAuthGuard>
                <AuthGuard>
                  <RouterLink to="/admin/summary" id="menu_projects">
                    Projects
                  </RouterLink>
                </AuthGuard>
                <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <RouterLink to="/admin/users" id="menu_admin_users">
                    Manage Users
                  </RouterLink>
                </SystemRoleGuard>
                <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
                  <RouterLink to="/admin/funding-sources" id="menu_admin_funding_sources">
                    Funding Sources
                  </RouterLink>
                </SystemRoleGuard>
                <RouterLink to="/standards" id="menu_standards">
                  Standards
                </RouterLink>
                <Button
                  color="inherit"
                  variant="text"
                  disableElevation
                  onClick={showSupportDialog}
                  sx={{
                    m: '8px',
                    p: 1
                  }}>
                  Support
                </Button>
              </Box>
            </Box>
            <Box flex="0 0 auto">
              <UnAuthGuard>
                <PublicViewUser />
              </UnAuthGuard>
              <AuthGuard>
                <LoggedInUser />
              </AuthGuard>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Dialog open={open}>
        <DialogTitle>Contact Support</DialogTitle>
        <DialogContent>
          <Typography variant="body1" component="div" color="textSecondary">
            For technical support or questions about this application, please email &zwnj;
            <a href="mailto:biohub@gov.bc.ca?subject=Support Request - Species Inventory Management System">
              biohub@gov.bc.ca
            </a>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="primary" onClick={hideSupportDialog}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;
