import { Box, Button, CircularProgress, Paper, Typography } from '@material-ui/core';
import { mdiTrayPlus } from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

export interface IProjectAttachmentsProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Project attachments content for a project.
 *
 * @return {*}
 */
const ProjectAttachments: React.FC<IProjectAttachmentsProps> = () => {
  const urlParams = useParams();

  const projectId = urlParams['id'];

  const biohubApi = useBiohubApi();

  const [project, setProject] = useState<IGetProjectForViewResponse | null>(null);

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);

  useEffect(() => {
    const getProject = async () => {
      const projectResponse = await biohubApi.project.getProjectForView(projectId);

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

  if (!project) {
    return <CircularProgress></CircularProgress>;
  }

  return (
    <>
      <ComponentDialog
        open={openUploadAttachments}
        dialogTitle="Upload Attachments"
        onClose={() => setOpenUploadAttachments(false)}>
        <FileUpload projectId={projectId} />
      </ComponentDialog>
      <Box mb={5}>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="h2">Project Attachments</Typography>
          </Box>
          <Box>
            <Button variant="outlined" onClick={() => setOpenUploadAttachments(true)}>
              <Icon path={mdiTrayPlus} size={1} />
              <Typography>Upload</Typography>
            </Button>
          </Box>
        </Box>
      </Box>
      <Box mb={3}>
        <Paper>
          <Box p={3}>Attachments list placeholder</Box>
        </Paper>
      </Box>
    </>
  );
};

export default ProjectAttachments;
