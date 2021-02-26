import { Box, Button, CircularProgress, Container, Typography, makeStyles } from '@material-ui/core';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProject } from 'interfaces/project-interfaces';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { DropzoneArea } from 'material-ui-dropzone';
import { UploadProjectArtifactsI18N } from 'constants/i18n';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';


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

const useStyles = makeStyles((theme) => ({
  stepper: {
    backgroundColor: 'transparent'
  },
  actionsContainer: {
    marginBottom: theme.spacing(2)
  },
  actionButton: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  finishContainer: {
    padding: theme.spacing(3),
    backgroundColor: 'transparent'
  }
}));

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

  const classes = useStyles();

  const [files, setFiles] = useState<File[] | null>(null);

  // Whether or not to show the text dialog
  const [openErrorDialogProps, setOpenErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: UploadProjectArtifactsI18N.uploadErrorTitle,
    dialogText: UploadProjectArtifactsI18N.uploadErrorText,
    open: false,
    onClose: () => {
      setOpenErrorDialogProps({ ...openErrorDialogProps, open: false });
    },
    onOk: () => {
      setOpenErrorDialogProps({ ...openErrorDialogProps, open: false });
    }
  });

  // TODO this is using IProject in the mean time, but will eventually need something like IProjectRecord
  const [project, setProject] = useState<IProject | null>(null);

  const handleUpload = async () => {
    const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
      setOpenErrorDialogProps({ ...openErrorDialogProps, ...textDialogProps, open: true });
    };

    if (files && files.length > 0) {
      try {
        const uploadResponse = await biohubApi.uploadProjectArtifacts(urlParams['id'], files);

        if (!uploadResponse) {
          // TODO do something to handle upload error
          showErrorDialog({ dialogError: 'Server responded with null.' });
        }
      } catch (error) {
        showErrorDialog({ ...((error?.message && { dialogError: error.message }) || {}) });
      }
    }

  };

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
  }, [urlParams, biohubApi, project, files]);

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
          <hr />
          <ErrorDialog {...openErrorDialogProps} />
          <DropzoneArea
            dropzoneText="Select files"
            filesLimit={10}
            onChange={(e) => {
              setFiles(e);
            }}
            showFileNames={true}
            useChipsForPreview={true}
          />
        </Box>
        <Box>
          <Button variant="contained" color="primary" onClick={handleUpload} className={classes.actionButton}>
            <Typography variant="body1">Upload</Typography>
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default ProjectPage;
