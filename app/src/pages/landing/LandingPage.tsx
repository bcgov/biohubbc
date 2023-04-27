import React, { useContext, useMemo } from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { AuthStateContext } from 'contexts/authStateContext';
import BaseLayout from 'layouts/BaseLayout';
import { AuthGuard, UnAuthGuard } from 'components/security/Guards';
import { Link } from 'react-router-dom';
import { SYSTEM_ROLE } from 'constants/roles';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => ({
  baseLayoutContainer: {
    // Contingency background, pending hero image load
    background: '#00438A linear-gradient(to bottom, #00438A, #00274D)',
    backgroundImage: `url('/assets/hero.jpg')`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    color: theme.palette.primary.contrastText,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    height: '30rem',

    '& > main': {
      display: 'flex',
      marginTop: theme.spacing(-6),
    }
  },
  heroHeader: {
    maxWidth: '22ch',
    fontSize: '3.5rem',
    letterSpacing: '-0.03rem',
    textShadow: '0px 0px 15px rgba(0,13,26,0.5)'
  },
  heroSubheader: {
    maxWidth: '45ch',
    marginTop: '3rem',
    marginBottom: '3rem',
    fontSize: '1.325rem',
    lineHeight: '1.5',
    textShadow: '0px 0px 10px rgba(0,13,26,1)'
  },
  heroButton: {
    color: theme.palette.primary.main,
    fontWeight: 700,
    backgroundColor: '#fcba19',
    padding: '12px 44px'
  },
  loginButton: {
    textTransform: 'uppercase'
  },
  actionsContainer: {
    maxWidth: '45ch',

    '& p': {
      margin: '1.5rem 0'
    }
  },
  actions: {
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    gap: '1rem',

    '& > span': {
      textTransform: 'uppercase'
    }
  },
  heroLink: {
    color: '#fcba19',
    fontWeight: 700,
    textDecoration: 'none'
  },
  username: {
    textTransform: 'uppercase'
  }
}));

export const LandingPage = () => {
  const { keycloakWrapper } = useContext(AuthStateContext);
  const classes = useStyles();

  const loginUrl = useMemo(() => keycloakWrapper?.getLoginUrl(), []);
  const userIdentifier = keycloakWrapper?.getUserIdentifier() || '';

  const hasAdministrativeRole = keycloakWrapper?.hasSystemRole([SYSTEM_ROLE.DATA_ADMINISTRATOR, SYSTEM_ROLE.SYSTEM_ADMIN]);

  return (
    <BaseLayout className={classes.baseLayoutContainer}>
      <Container maxWidth="md">
        <Typography variant="h1" className={classes.heroHeader}>
          Species Inventory Management System
        </Typography>
        <Typography variant="body1" className={classes.heroSubheader}>
          Upload and submit your species inventory project data to help understand how we can better protect and preserve biodiversity in British Columbia.
        </Typography>
        <Box className={classes.actionsContainer}>
          <UnAuthGuard>
            <>
              <Typography variant="body2">
                To access this application, you must use a valid BC government-issued IDIR or BCeID account credential.
              </Typography>
              <Button
                component='a'
                href={loginUrl}
                variant='contained'
                className={clsx(classes.heroButton, classes.loginButton)}
                size='large'
              >
                Log In
              </Button>
              <Typography variant="body2">
                Don't have an account? <a className={classes.heroLink} href='/'>Register here.</a>
              </Typography>
            </>
          </UnAuthGuard>
          <AuthGuard>
            <Typography variant="body1" className={classes.heroSubheader}>
              <span>Welcome&nbsp;back</span>
              {userIdentifier && (
                <span>,&nbsp;<strong className={classes.username}>{userIdentifier}</strong></span>
              )}
            </Typography>
            <Box className={classes.actions}>
            
              <Button
                component={Link}
                to='/admin/projects'
                variant='contained'
                className={classes.heroButton}
                size='large'
                children={<>View&nbsp;Projects</>}
              />
              <Typography component="span">Or</Typography>
              {hasAdministrativeRole ? (
                <Button
                  component={Link}
                  to='/admin/users'
                  variant='contained'
                  className={classes.heroButton}
                  size='large'
                  children={<>Manage&nbsp;Users</>}
                />
              ) : (
                <Button
                  component={Link}
                  to='/admin/projects/create'
                  variant='contained'
                  className={classes.heroButton}
                  size='large'
                  children={<>Create&nbsp;a&nbsp;Project</>}
                />
              )}
            </Box>
          </AuthGuard>
        </Box>
      </Container>
    </BaseLayout>
  );
};
