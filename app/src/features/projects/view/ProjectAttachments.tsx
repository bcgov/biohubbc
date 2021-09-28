import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { mdiUploadOutline } from '@mdi/js';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import FileUpload from 'components/attachments/FileUpload';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { ProjectAttachmentType, ProjectAttachmentValidExtensions } from 'constants/attachments';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment, IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getKeyByValue } from 'utils/Utils';

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
  const [attachmentType, setAttachmentType] = useState<string>('');

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

  const uploadAttachments = (): IUploadHandler => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return biohubApi.project.uploadProjectAttachments(
        projectId,
        file,
        attachmentType,
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
          <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%', marginBottom: '1rem' }}>
            <InputLabel id="attachment_type-label">Attachment Type</InputLabel>
            <Select
              id="attachment_type"
              name="attachment_type"
              labelId="attachment_type-label"
              label="Attachment Type"
              value={attachmentType}
              onChange={(e) => setAttachmentType(e.target.value as string)}
              displayEmpty
              inputProps={{ 'aria-label': 'Attachment Type' }}>
              {Object.keys(ProjectAttachmentType).map((key) => (
                <MenuItem key={key} value={ProjectAttachmentType[key]}>
                  {ProjectAttachmentType[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {attachmentType && (
            <FileUpload
              uploadHandler={uploadAttachments()}
              dropZoneProps={{
                acceptedFileExtensions:
                  ProjectAttachmentValidExtensions[getKeyByValue(ProjectAttachmentType, attachmentType) || 'OTHER']
              }}
            />
          )}
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
