import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { mdiInformationOutline, mdiPaperclip } from '@mdi/js';
import Icon from '@mdi/react';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';
import { getFormattedDateRangeString } from 'utils/Utils';
import { ProjectStatusType } from 'constants/misc';
import Chip from '@material-ui/core/Chip';
import clsx from 'clsx';
import PublicProjectDetails from './PublicProjectDetails';
import PublicProjectAttachments from './components/PublicProjectAttachments';

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
  chip: {
    padding: '0px 8px',
    borderRadius: '4px',
    color: 'white'
  },
  chipActive: {
    backgroundColor: theme.palette.warning.main
  },
  chipCompleted: {
    backgroundColor: theme.palette.success.main
  },
  spacingRight: {
    paddingRight: '1rem'
  }
}));

/**
 * Page to display a single Public (published) Project.
 *
 * @return {*}
 */
const PublicProjectPage = () => {
  const urlParams = useParams();
  const restorationTrackerApi = useRestorationTrackerApi();
  const classes = useStyles();
  const location = useLocation();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await restorationTrackerApi.public.project.getProjectForView(
      urlParams['id'] || 1
    );

    if (!projectWithDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [restorationTrackerApi.public.project, urlParams]);

  useEffect(() => {
    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(true);
    }
  }, [isLoadingProject, projectWithDetails, getProject]);

  const getChipIcon = (status_name: string) => {
    let chipLabel;
    let chipStatusClass;

    if (ProjectStatusType.ACTIVE === status_name) {
      chipLabel = 'ACTIVE';
      chipStatusClass = classes.chipActive;
    } else if (ProjectStatusType.COMPLETED === status_name) {
      chipLabel = 'COMPLETED';
      chipStatusClass = classes.chipCompleted;
    }

    return <Chip size="small" className={clsx(classes.chip, chipStatusClass)} label={chipLabel} />;
  };

  if (!projectWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Paper elevation={2} square={true}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between">
            <Box py={4}>
              <Box mb={1} display="flex">
                <Typography className={classes.spacingRight} variant="h1">
                  {projectWithDetails.project.project_name}
                </Typography>
                {getChipIcon(projectWithDetails.project.completion_status)}
              </Box>
              <Box>
                <Typography variant="subtitle1" color="textSecondary">
                  <span>
                    {projectWithDetails.project.end_date ? (
                      <>
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
                  </span>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        <Box display="flex" flexDirection="row" py={6}>
          <Box component="aside" mr={6} mt={-2}>
            <Paper>
              <List component="nav" role="navigation" className={classes.projectNav} aria-label="Project Navigation">
                <ListItem component={NavLink} to="details">
                  <ListItemIcon>
                    <Icon path={mdiInformationOutline} size={1} />
                  </ListItemIcon>
                  <ListItemText>Project Details</ListItemText>
                </ListItem>
                <ListItem component={NavLink} to="attachments">
                  <ListItemIcon>
                    <Icon path={mdiPaperclip} size={1} />
                  </ListItemIcon>
                  <ListItemText>Attachments</ListItemText>
                </ListItem>
              </List>
            </Paper>
          </Box>
          <Box component="article" flex="1 1 auto">
            {location.pathname.includes('/details') && (
              <PublicProjectDetails projectForViewData={projectWithDetails} refresh={getProject} />
            )}
            {location.pathname.includes('/attachments') && (
              <PublicProjectAttachments projectForViewData={projectWithDetails} />
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default PublicProjectPage;
