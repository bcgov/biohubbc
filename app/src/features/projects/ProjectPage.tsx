import { Box, CircularProgress, Container, Typography } from '@material-ui/core';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProject } from 'interfaces/project-interfaces';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { DropzoneArea } from 'material-ui-dropzone';

// export interface IFormControlsComponentProps {
//   id: number;
//   isDisabled?: boolean;
// }

// const FormControlsComponent: React.FC<IFormControlsComponentProps> = (props) => {
//   const history = useHistory();

//   const navigateToEditProjectPage = (id: number) => {
//     history.push(`/projects/${id}/edit`);
//   };

//   return (
//     <>
//       <Grid container spacing={3}>
//         <Grid container item spacing={3}>
//           <Grid item>
//             <Button variant="text" color="primary" startIcon={<ArrowBack />} onClick={() => history.goBack()}>
//               Back to Projects
//             </Button>
//           </Grid>
//           <Grid item>
//             <Button variant="contained" color="primary" onClick={() => navigateToEditProjectPage(props.id)}>
//               Edit
//             </Button>
//           </Grid>
//         </Grid>
//       </Grid>
//     </>
//   );
// };

/**
 * Page to display a single Project.
 *
 * // TODO WIP
 *
 * @return {*}
 */
const ProjectPage: React.FC = () => {
  const urlParams = useParams();

  const biohubApi = useBiohubApi();

  // TODO this is using IProject in the mean time, but will eventually need something like IProjectRecord
  const [project, setProject] = useState<IProject | null>(null);

  useEffect(() => {
    const getProject = async () => {
      const projectResponse = await biohubApi.getProject(urlParams['id']);

      if (!projectResponse) {
        // TODO error handling/messaging
        return;
      }

      setProject(projectResponse);
    };

    if (!project) {
      getProject();
    }
  }, [urlParams, biohubApi, project]);

  // const handleChange = () => {};

  // const handleSubmitSuccess = () => {};

  if (!project) {
    return <CircularProgress></CircularProgress>;
  }

  return (
    <Box my={3}>
      <Container>
        <Box mb={3}>
          <Typography variant="h2">{`Project ${project.id}`}</Typography>
        </Box>
        <Box>
          {JSON.stringify(project, null, 2)}
          {/* <FormContainer
            isDisabled={true}
            record={project}
            template={projectTemplate}
            formControlsComponent={(props) => {
              return <FormControlsComponent id={project.id} isDisabled={true} {...props} />;
            }}
            onFormChange={handleChange}
            onFormSubmitSuccess={handleSubmitSuccess}></FormContainer> */}
        </Box>
        <Box>
          <hr/>
          <DropzoneArea
            dropzoneText="Upload project artifacts here"
            filesLimit={ 10 }
            onChange={(e) => {
            }}
            showFileNames={true}
            //useChipsForPreview={true}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default ProjectPage;
