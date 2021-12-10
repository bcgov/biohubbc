import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
//import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Icon from '@mdi/react';
import { mdiTrashCanOutline } from '@mdi/js';

import { useHistory } from 'react-router';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { IGetUserResponse } from 'interfaces/useUserApi.interface';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  projectNav: {
    minWidth: '15rem',
    '& a': {
      color: theme.palette.text.secondary,
      '&:hover': {
        background: 'rgba(0, 51, 102, 0.05)'
      }
    },
    '& a.active': {
      color: theme.palette.primary.main,
      background: 'rgba(0, 51, 102, 0.05)',
      '& svg': {
        color: theme.palette.primary.main
      }
    }
  },
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  chip: {
    color: '#ffffff'
  },
  chipActive: {
    backgroundColor: theme.palette.success.main
  },
  chipCompleted: {
    backgroundColor: theme.palette.primary.main
  },
  spacingRight: {
    paddingRight: '1rem'
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  projectTitle: {
    fontWeight: 400
  }
}));

export interface IUsersHeaderProps {
  userDetails: IGetUserResponse;
}

const UsersDetailHeader: React.FC<IUsersHeaderProps> = (props) => {
  const classes = useStyles();
  const uHistory = useHistory();

  const { userDetails } = props;

  return (
    <Paper square={true}>
      <Container maxWidth="xl">
        <Box pt={3} pb={2}>
          <Breadcrumbs>
            <Link
              color="primary"
              onClick={() => uHistory.push('/admin/users')}
              aria-current="page"
              className={classes.breadCrumbLink}>
              <Typography variant="body2">Manage Users</Typography>
            </Link>
            <Typography variant="body2">{userDetails.user_identifier}</Typography>
          </Breadcrumbs>
        </Box>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box pb={3}>
            <Box mb={1.5} display="flex">
              <Typography className={classes.spacingRight} variant="h1">
                User - <span className={classes.projectTitle}>{userDetails.user_identifier}</span>
              </Typography>
            </Box>
            <Box mb={0.75} display="flex" alignItems="center">
              &nbsp;&nbsp;
              <Typography component="span" variant="subtitle1" color="textSecondary">
                {userDetails.role_names[0]}
              </Typography>
            </Box>
          </Box>
          <Box ml={4} mb={4}>
            <Tooltip arrow color="secondary" title={'delete'}>
              <>
                <IconButton>
                  <Icon path={mdiTrashCanOutline} size={1} />
                </IconButton>
              </>
            </Tooltip>
          </Box>
        </Box>
      </Container>
    </Paper>
  );
};

export default UsersDetailHeader;
