import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
// import Grid from '@material-ui/core/Grid';
// import Chip from '@material-ui/core/Chip';
import Container from '@material-ui/core/Container';
// import IconButton from '@material-ui/core/IconButton';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiAccountMultipleOutline, mdiCalendarRangeOutline, mdiChevronDown, mdiCogOutline, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
// import clsx from 'clsx';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { DeleteProjectI18N } from 'constants/i18n';
// import { ProjectStatusType } from 'constants/misc';
import { SYSTEM_ROLE } from 'constants/roles';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useContext } from 'react';
import { useHistory } from 'react-router';
import { getFormattedDateRangeString } from 'utils/Utils';

const useStyles = makeStyles((theme: Theme) => ({
  titleActions: {
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.75)
  },
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
  projectTitleContainer: {
    maxWidth: '170ch',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  projectTitle: {
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical', 
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    overflow: 'hidden'
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
  projectMeta: {
    marginTop: theme.spacing(3),
    marginBottom: 0,
    '& dd': {
      flex: '0 0 200px',
      color: theme.palette.text.secondary
    },
    '& dt': {
      flex: '1 1 auto'
    }
  },
  projectMetaRow: {
    display: 'flex',
    '& + div': {
      marginTop: theme.spacing(0.25)
    }
  }
}));

export interface IProjectHeaderProps {
  projectWithDetails: IGetProjectForViewResponse;
  refresh?: () => void;
}

/**
 * Project header for a single-project view.
 *
 * @param {*} props
 * @return {*}
 */
const ProjectHeader: React.FC<IProjectHeaderProps> = (props) => {
  const { projectWithDetails } = props;

  const classes = useStyles();
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const { keycloakWrapper } = useContext(AuthStateContext);

  const defaultYesNoDialogProps = {
    dialogTitle: DeleteProjectI18N.deleteTitle,
    dialogText: DeleteProjectI18N.deleteText,
    open: false,
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false }),
    onYes: () => dialogContext.setYesNoDialog({ open: false })
  };

  const deleteErrorDialogProps = {
    dialogTitle: DeleteProjectI18N.deleteErrorTitle,
    dialogText: DeleteProjectI18N.deleteErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showDeleteProjectDialog = () => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      open: true,
      onYes: () => {
        deleteProject();
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const deleteProject = async () => {
    if (!projectWithDetails) {
      return;
    }

    try {
      const response = await biohubApi.project.deleteProject(projectWithDetails.id);

      if (!response) {
        showDeleteErrorDialog({ open: true });
        return;
      }

      history.push(`/admin/projects`);
    } catch (error) {
      const apiError = error as APIError;
      showDeleteErrorDialog({ dialogText: apiError.message, open: true });
      return error;
    }
  };

  const showDeleteErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...deleteErrorDialogProps, ...textDialogProps, open: true });
  };

  // const getChipIcon = (status_name: string) => {
  //   let chipLabel;
  //   let chipStatusClass;

  //   if (ProjectStatusType.ACTIVE === status_name) {
  //     chipLabel = 'Active';
  //     chipStatusClass = classes.chipActive;
  //   } else if (ProjectStatusType.COMPLETED === status_name) {
  //     chipLabel = 'Complete';
  //     chipStatusClass = classes.chipCompleted;
  //   }

  //   return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  // };

  // Show delete button if you are a system admin or a project admin
  const showDeleteProjectButton = keycloakWrapper?.hasSystemRole([
    SYSTEM_ROLE.SYSTEM_ADMIN,
    SYSTEM_ROLE.PROJECT_CREATOR,
    SYSTEM_ROLE.DATA_ADMINISTRATOR
  ]);

  // Show/Hide Project Settings Menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Paper square={true} elevation={0}>
      <Container maxWidth="xl">
        <Box py={4}>

          <Box mb={3}>
            <Breadcrumbs>
              <Link
                color="primary"
                onClick={() => history.push('/admin/projects')}
                aria-current="page">
                <Typography variant="body1" component="span">Projects</Typography>
              </Link>
              <Typography variant="body1" component="span">{projectWithDetails.project.project_name}</Typography>
            </Breadcrumbs>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Box className={classes.projectTitleContainer}>
              <Typography variant="h1" className={classes.projectTitle}>
                Project: <span>{projectWithDetails.project.project_name}</span>
              </Typography>
              <Box mt={1} display="flex" alignItems="center">
                {/* {getChipIcon(projectWithDetails.project.completion_status)} */}
                <Typography component="span" variant="subtitle1" color="textSecondary" style={{display: 'flex', alignItems: 'center'}}>
                  {projectWithDetails.project.end_date ? (
                    <>
                      <Icon path={mdiCalendarRangeOutline} size={0.8} style={{marginRight: '0.5rem'}}/>
                      <strong>Project Timeline:&nbsp;&nbsp;</strong>
                      {getFormattedDateRangeString(
                        DATE_FORMAT.ShortMediumDateFormat,
                        projectWithDetails.project.start_date,
                        projectWithDetails.project.end_date
                      )}
                    </>
                  ) : (
                    <>
                      <span>Start Date:</span>{' '}
                      {getFormattedDateRangeString(
                        DATE_FORMAT.ShortMediumDateFormat,
                        projectWithDetails.project.start_date
                      )}
                    </>
                  )}
                </Typography>
              </Box>
            </Box>
            <Box flex="0 0 auto" className={classes.titleActions}>
              <Button
                variant="outlined"
                startIcon={<Icon path={mdiCogOutline} size={0.8} />}
                endIcon={<Icon path={mdiChevronDown} size={0.8} />}
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}>
                Project Settings
              </Button>
              <Menu style={{marginTop: '8px'}}
                id="projectSettingsMenu"
                anchorEl={anchorEl}
                getContentAnchorEl={null}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => history.push('users')}>
                  <ListItemIcon>
                    <Icon path={mdiAccountMultipleOutline} size={0.8} />
                  </ListItemIcon>
                  <Typography variant="inherit">Manage Project Team</Typography>
                </MenuItem>
                <MenuItem>
                  <ListItemIcon>
                    <Icon path={mdiPencilOutline} size={0.8} />
                  </ListItemIcon>
                  <Typography variant="inherit">Edit Project Details</Typography>
                </MenuItem>
                {showDeleteProjectButton && (
                  <MenuItem onClick={showDeleteProjectDialog}>
                    <ListItemIcon>
                      <Icon path={mdiTrashCanOutline} size={0.8} />
                    </ListItemIcon>
                    <Typography variant="inherit">Delete Project</Typography>
                  </MenuItem>
                )}
              </Menu>
            </Box>
          </Box>

        </Box>
      </Container>
    </Paper>
  );
};

export default ProjectHeader;
