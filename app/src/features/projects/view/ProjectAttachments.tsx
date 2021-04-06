import { Box, Button, Typography } from '@material-ui/core';
import { mdiTrayPlus } from '@mdi/js';
import Icon from '@mdi/react';
import FileUpload from 'components/attachments/FileUpload';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { useParams } from 'react-router';
import AttachmentsList from 'components/attachments/AttachmentsList';

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

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);

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
        <Box p={3}>
          <AttachmentsList projectId={projectId} />
        </Box>
      </Box>
    </>
  );
};

export default ProjectAttachments;
