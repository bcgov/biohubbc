import { Box, CircularProgress, Container, Typography } from '@material-ui/core';
import EditFormControlsComponent from 'components/form/EditFormControlsComponent';
import FormContainer from 'components/form/FormContainer';
import { projectTemplate } from 'constants/project-templates';
import { testProject } from 'constants/temp_demo';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProjectRecord } from 'interfaces/project-interfaces';
import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router';

/**
 * Page to display a single Project in edit mode.
 *
 * @return {*}
 */
const EditProjectPage: React.FC = () => {
  // const urlParams = useParams();

  const biohubApi = useBiohubApi();

  const [project, setProject] = useState<IProjectRecord | null>(null);

  useEffect(() => {
    // This function is not fully flushed out or tested
    const getProject = async () => {
      // TODO disable for demo purposes

      // const projectResponse = await biohubApi.getProject(urlParams['id']);

      // if (!projectResponse) {
      //   // TODO error messaging
      //   return;
      // }

      setProject(testProject /*templateResponse*/);
    };

    if (!project) {
      getProject();
    }
  }, [biohubApi, project]);

  const handleChange = () => {};

  const handleSubmitSuccess = () => {};

  if (!project) {
    return <CircularProgress></CircularProgress>;
  }

  return (
    <Box my={3}>
      <Container>
        <Box mb={3}>
          <Typography variant="h2">{`Edit Project ${project.id}`}</Typography>
        </Box>
        <Box>
          <FormContainer
            record={project}
            template={projectTemplate}
            formControlsComponent={<EditFormControlsComponent />}
            onFormChange={handleChange}
            onFormSubmitSuccess={handleSubmitSuccess}></FormContainer>
        </Box>
      </Container>
    </Box>
  );
};

export default EditProjectPage;
