import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { useHistory } from 'react-router';

export interface IProjectSurveysListPageProps {
  projectForViewData: IGetProjectForViewResponse;
}

const useStyles = makeStyles((theme: Theme) => ({
  projectDetailsSection: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(5),

    '&:last-child': {
      marginBottom: 0
    },

    '&:first-child': {
      marginTop: 0
    }
  },

  sectionDivider: {
    height: '3px'
  }
}));

/**
 * Project surveys content for a project.
 *
 * @return {*}
 */
const ProjectSurveysListPage: React.FC<IProjectSurveysListPageProps> = (props) => {
  const history = useHistory();
  const { projectForViewData } = props;
  const classes = useStyles();

  const projectId = projectForViewData.id;

  const navigateToCreateSurveyPage = (projectId: number) => {
    history.push(`/projects/${projectId}/survey/create`);
  };

  return (
    <>
      <Box my={4}>
        <Container maxWidth="xl">
          <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h1">Surveys</Typography>
            <Button variant="outlined" color="primary" onClick={() => navigateToCreateSurveyPage(projectId)}>
              Create Survey
            </Button>
          </Box>
          <Box component={Paper} p={4}>
            <Box component="section" className={classes.projectDetailsSection}>
              <Box>Survey list goes here</Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default ProjectSurveysListPage;
