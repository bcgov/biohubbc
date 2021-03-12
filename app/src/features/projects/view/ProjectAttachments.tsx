import { Box, Button, CircularProgress, makeStyles, Paper, Typography } from '@material-ui/core';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { UploadProjectArtifactsI18N } from 'constants/i18n';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IProjectWithDetails } from 'interfaces/project-interfaces';
import { DropzoneArea } from 'material-ui-dropzone';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

const useStyles = makeStyles((theme) => ({
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  breadCrumbLinkIcon: {
    marginRight: '0.25rem'
  },
  actionButton: {
    marginTop: theme.spacing(1),
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

export interface IProjectAttachmentsProps {
  projectWithDetailsData: IProjectWithDetails;
}

/**
 * Project attachments content for a project.
 *
 * @return {*}
 */
const ProjectAttachments: React.FC<IProjectAttachmentsProps> = () => {
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
  const [project, setProject] = useState<IProjectWithDetails | null>(null);

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

  if (!project) {
    return <CircularProgress></CircularProgress>;
  }

  return (
    <>
      <Box mb={5}>
        <Typography variant="h2">Project Attachments</Typography>
      </Box>
      <Box mb={3}>
        <Paper>
          <Box p={3}>Project attachments component 1 placeholder</Box>
        </Paper>
      </Box>
      <Box mb={3}>
        <Paper>
          <Box p={3}>
            <Box key={dropzoneInstanceKey}>
              <DropzoneArea
                dropzoneText={dropzoneText}
                filesLimit={10}
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
          </Box>
        </Paper>
      </Box>
    </>
  );
};

export default ProjectAttachments;
