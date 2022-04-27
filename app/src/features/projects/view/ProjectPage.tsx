import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { ViewProjectI18N } from 'constants/i18n';
import LocationBoundary from 'features/projects/view/components/LocationBoundary';
import ProjectAttachments from 'features/projects/view/ProjectAttachments';
import ProjectDetails from 'features/projects/view/ProjectDetails';
import ProjectHeader from 'features/projects/view/ProjectHeader';
import SurveysListPage from 'features/surveys/list/SurveysListPage';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import React from 'react';
import { useParams } from 'react-router';

/**
 * Page to display a single Project.
 *
 * @return {*}
 */
const ProjectPage: React.FC = () => {
  const urlParams = useParams();

  const biohubApi = useBiohubApi();

  const codesDataLoader = useDataLoader(() => biohubApi.codes.getAllCodeSets());
  codesDataLoader.load();

  const projectDataLoader = useDataLoader(() => biohubApi.project.getProjectForView(urlParams['id']));
  projectDataLoader.load();

  useDataLoaderError(projectDataLoader, () => ({
    dialogTitle: ViewProjectI18N.errorTitle,
    dialogText: ViewProjectI18N.errorText
  }));

  if (!codesDataLoader.data || !projectDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <ProjectHeader projectWithDetails={projectDataLoader.data} refresh={projectDataLoader.refresh} />

      <Container maxWidth="xl">
        <Box my={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Box>
                <ProjectDetails
                  projectForViewData={projectDataLoader.data}
                  codes={codesDataLoader.data}
                  refresh={projectDataLoader.refresh}
                />
              </Box>
              <Box mt={3}>
                <SurveysListPage projectForViewData={projectDataLoader.data} />
              </Box>
              <Box mt={3}>
                <ProjectAttachments projectForViewData={projectDataLoader.data} />
              </Box>
            </Grid>
            <Grid item xs={12} lg={4}>
              <LocationBoundary
                projectForViewData={projectDataLoader.data}
                codes={codesDataLoader.data}
                refresh={projectDataLoader.refresh}
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default ProjectPage;
