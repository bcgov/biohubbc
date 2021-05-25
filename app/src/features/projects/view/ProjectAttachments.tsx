import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { mdiUploadOutline } from '@mdi/js';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import FileUpload from 'components/attachments/FileUpload';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment, IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
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

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) {
        return;
      }

      try {
        const response = await biohubApi.project.getProjectAttachments(projectId);

        if (!response?.attachmentsList) {
          return;
        }

        setAttachmentsList([...response.attachmentsList]);
      } catch (error) {
        return error;
      }
    },
    [biohubApi.project, projectId, attachmentsList.length]
  );

  useEffect(() => {
    getAttachments(false);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <ComponentDialog
        open={openUploadAttachments}
        dialogTitle="Upload Attachments"
        onClose={() => {
          getAttachments(true);
          setOpenUploadAttachments(false);
        }}>
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
        <AttachmentsList projectId={projectId} attachmentsList={attachmentsList} getAttachments={getAttachments} />
      </Box>
    </>
  );
};

export default ProjectAttachments;
