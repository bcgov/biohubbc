import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { mdiUploadOutline } from '@mdi/js';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import FileUploadWithMeta from 'components/attachments/FileUploadWithMeta';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
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

  const getUploadHandler = (): IUploadHandler => {
    return (file, cancelToken, handleFileUploadProgress, fileType) => {
      return biohubApi.project.uploadProjectAttachments(
        projectId,
        file,
        fileType,
        cancelToken,
        handleFileUploadProgress
      );
    };
  };

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
        <Box>
          <FileUploadWithMeta uploadHandler={getUploadHandler()} />
        </Box>
      </ComponentDialog>
      <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h2">Project Attachments</Typography>
        <Box my={-1}>
          <Button
            color="primary"
            variant="outlined"
            startIcon={<Icon path={mdiUploadOutline} size={1} />}
            onClick={() => setOpenUploadAttachments(true)}>
            Upload
          </Button>
        </Box>
      </Box>
      <Box mb={3}>
        <AttachmentsList projectId={projectId} attachmentsList={attachmentsList} getAttachments={getAttachments} />
      </Box>
    </>
  );
};

export default ProjectAttachments;
