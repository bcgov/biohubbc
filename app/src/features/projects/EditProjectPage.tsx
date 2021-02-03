import { Box, CircularProgress, Container, Typography } from '@material-ui/core';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProject } from 'interfaces/project-interfaces';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

// export interface IEditFormControlsComponentProps {
//   onSubmit?: Function;
//   isDisabled?: boolean;
// }

// const EditFormControlsComponent: React.FC<IEditFormControlsComponentProps> = (props) => {
//   const history = useHistory();

//   const isDisabled = props.isDisabled || false;

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
//             <Button
//               disabled={isDisabled}
//               variant="contained"
//               color="primary"
//               onClick={() => {
//                 if (!props || !props.onSubmit) {
//                   return;
//                 }

//                 props.onSubmit();
//               }}>
//               Save
//             </Button>
//           </Grid>
//         </Grid>
//       </Grid>
//     </>
//   );
// };

/**
 * Page to display a single Project in edit mode.
 *
 * // TODO WIP
 *
 * @return {*}
 */
const EditProjectPage: React.FC = () => {
  const urlParams = useParams();

  const biohubApi = useBiohubApi();

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
          <Typography variant="h2">{`Edit Project ${project.id}`}</Typography>
        </Box>
        <Box>
          {JSON.stringify(project, null, 2)}
          {/* <FormContainer
            record={project}
            template={projectTemplate}
            formControlsComponent={(props) => {
              return <EditFormControlsComponent {...props} />;
            }}
            onFormChange={handleChange}
            onFormSubmitSuccess={handleSubmitSuccess}></FormContainer> */}
        </Box>
      </Container>
    </Box>
  );
};

export default EditProjectPage;
