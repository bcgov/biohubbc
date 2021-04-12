import { Box, Button, Typography } from '@material-ui/core';
import { mdiUploadOutline } from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { IGetProjectForViewResponse, IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router';
import AttachmentsList from 'components/attachments/AttachmentsList';
import { useBiohubApi } from 'hooks/useBioHubApi';

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

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);

  const getAttachments = useCallback(async () => {
    try {
      const response = await biohubApi.project.getProjectAttachments(projectId);

      if (!response?.attachmentsList) {
        return;
      }

      setAttachmentsList([...response.attachmentsList]);
    } catch (error) {
      return error;
    }
  }, [biohubApi.project, projectId]);

  useEffect(() => {
    getAttachments();
  }, [getAttachments, openUploadAttachments]);

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
              <Icon path={mdiUploadOutline} size={1} />
              <Typography>Upload</Typography>
            </Button>
          </Box>
        </Box>
      </Box>
      <Box mb={3}>
        <Box p={3}>
          <AttachmentsList projectId={projectId} attachmentsList={attachmentsList} getAttachments={getAttachments} />
        </Box>
      </Box>
    </>
  );
};

export default ProjectAttachments;
