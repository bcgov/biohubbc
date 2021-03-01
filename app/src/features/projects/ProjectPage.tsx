import { Box, Button, CircularProgress, Container, makeStyles, Typography } from '@material-ui/core';
//import { AttachFile } from '@material-ui/icons';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { UploadProjectArtifactsI18N } from 'constants/i18n';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProject } from 'interfaces/project-interfaces';
import { DropzoneArea } from 'material-ui-dropzone';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

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

  const [files, setFiles] = useState<File[]>([]);
  const [dropzoneText, setDropzoneText] = useState<string>('Select files');
  const [dropzoneInstanceKey, setDropzoneInstanceKey] = useState<number>(0);

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

    if (!files || !files.length) {
      setDropzoneText('Select files');
      return;
    }

    try {
      setDropzoneText('Uploading ...');
      const uploadResponse = await biohubApi.uploadProjectArtifacts(urlParams['id'], files);

      if (!uploadResponse) {
        setDropzoneText('Failed to upload, please try again');
        showErrorDialog({ dialogError: 'Server responded with null.' });
      } else {
        setDropzoneText('Success. ' + files.length + ' file' + (files.length > 1 ? 's' : '') + ' uploaded');

        // clear the files state
        setFiles([]);

        // implement the hack to reset the internal state of dropzone
        // https://github.com/react-dropzone/react-dropzone/issues/881
        setDropzoneInstanceKey(dropzoneInstanceKey > 0 ? 0 : 1);
      }
    } catch (error) {
      showErrorDialog({ ...((error?.message && { dialogError: error.message }) || {}) });
    }
  };

  const handleDeleteFile = async (f: File) => {
    let newFiles = files;

    setFiles(
      newFiles.filter(function (elem: File) {
        return elem !== f;
      })
    );
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
        <Box key={dropzoneInstanceKey}>
          <hr />
          <ErrorDialog {...openErrorDialogProps} />
          <DropzoneArea
            dropzoneText={dropzoneText}
            filesLimit={10}
            //fileObjects={files}
            onChange={(e) => {
              setFiles(e);
            }}
            onDelete={(f) => {
              handleDeleteFile(f);
            }}
            showFileNames={true}
            useChipsForPreview={true}
            showAlerts={['error']}
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
