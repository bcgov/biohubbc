import { Link as RouterLink } from 'react-router-dom';

import { mdiAccountCircle, mdiHomeVariant } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import useTheme from '@mui/material/styles/useTheme';
import { useAuthStateContext } from 'hooks/useAuthStateContext';

const LandingActionButton = () => {
  const authStateContext = useAuthStateContext();
  const theme = useTheme();

  const isAuthenticated = authStateContext.auth.isAuthenticated;

  const userIdentifier = authStateContext.simsUserWrapper.userIdentifier ?? '';

  const hasPendingAccessRequest = authStateContext.simsUserWrapper.hasAccessRequest;
  const isSystemUser = !!authStateContext.simsUserWrapper.systemUserId;

  const mayBelongToOneOrMoreProjects = isSystemUser ?? authStateContext.simsUserWrapper.hasOneOrMoreProjectRoles;
  const mayViewProjects = isSystemUser || mayBelongToOneOrMoreProjects;
  const mayMakeAccessRequest = !mayViewProjects && !hasPendingAccessRequest && isAuthenticated;

  console.log(userIdentifier);

  const heroButtonSx = {
    minWidth: '175px',
    padding: '1em 1.5em',
    color: theme.palette.primary.main,
    backgroundColor: '#fcba19',
    fontWeight: 700,
    '&:hover': {
      backgroundColor: '#fcba19'
    }
  };

  return (
    <Box
      sx={{
        margin: '0.6em 0',
        fontSize: '1em',
        display: 'flex',
        flexFlow: 'row nowrap',
        alignItems: 'center',
        gap: '0.5em',
        '& .MuiTypography-root': {
          color: '#fff'
        }
      }}>
      {!isAuthenticated && (
        <Box>
          <Button
            component="a"
            onClick={() => authStateContext.auth.signinRedirect()}
            sx={heroButtonSx}
            size="large"
            startIcon={<Icon path={mdiAccountCircle} size={1} />}
            data-testid="landing_page_login_button">
            Log In
          </Button>
        </Box>
      )}

      {mayViewProjects && (
        <Button
          component={RouterLink}
          to="/admin/projects"
          variant="contained"
          sx={heroButtonSx}
          size="large"
          startIcon={<Icon path={mdiHomeVariant} size={1} />}
          children={<>View&nbsp;Dashboard</>}
          data-testid="landing_page_projects_button"
        />
      )}
      {mayMakeAccessRequest && (
        <Button
          component={RouterLink}
          to="/access-request"
          variant="contained"
          sx={heroButtonSx}
          size="large"
          children={<>Request&nbsp;Access</>}
          data-testid="landing_page_request_access_button"
        />
      )}
    </Box>
  );
};

export default LandingActionButton;
