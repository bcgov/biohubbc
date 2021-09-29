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
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { ProjectSurveyAttachmentType, ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { IGetSurveyAttachment, IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getKeyByValue } from 'utils/Utils';

export interface ISurveyAttachmentsProps {
  projectForViewData: IGetProjectForViewResponse;
  surveyForViewData: IGetSurveyForViewResponse;
}

/**
 * Survey attachments content.
 *
 * @return {*}
 */
const SurveyAttachments: React.FC<ISurveyAttachmentsProps> = () => {
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];
  const biohubApi = useBiohubApi();

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);
  const [attachmentsList, setAttachmentsList] = useState<IGetSurveyAttachment[]>([]);
  const [attachmentType, setAttachmentType] = useState<string>('');

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) {
        return;
      }

      try {
        const response = await biohubApi.survey.getSurveyAttachments(projectId, surveyId);

        if (!response?.attachmentsList) {
          return;
        }

        setAttachmentsList([...response.attachmentsList]);
      } catch (error) {
        return error;
      }
    },
    [biohubApi.survey, projectId, surveyId, attachmentsList.length]
  );

  const uploadAttachments = (): IUploadHandler => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return biohubApi.survey.uploadSurveyAttachments(
        projectId,
        surveyId,
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
          setAttachmentType('');
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
              {Object.keys(ProjectSurveyAttachmentType).map((key) => (
                <MenuItem key={key} value={ProjectSurveyAttachmentType[key]}>
                  {ProjectSurveyAttachmentType[key]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {attachmentType && (
            <FileUpload
              uploadHandler={uploadAttachments()}
              dropZoneProps={{
                acceptedFileExtensions:
                  ProjectSurveyAttachmentValidExtensions[
                    getKeyByValue(ProjectSurveyAttachmentType, attachmentType) || 'OTHER'
                  ]
              }}
            />
          )}
        </Box>
      </ComponentDialog>
      <Box mb={5}>
        <Box display="flex" justifyContent="space-between">
          <Box>
            <Typography variant="h2">Survey Attachments</Typography>
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
        <AttachmentsList
          projectId={projectId}
          surveyId={surveyId}
          attachmentsList={attachmentsList}
          getAttachments={getAttachments}
        />
      </Box>
    </>
  );
};

export default SurveyAttachments;
