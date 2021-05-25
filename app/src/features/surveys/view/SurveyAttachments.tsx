import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { mdiUploadOutline } from '@mdi/js';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import FileUpload from 'components/attachments/FileUpload';
import ComponentDialog from 'components/dialog/ComponentDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment, IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

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
    [biohubApi.survey, surveyId, attachmentsList.length]
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
        <FileUpload projectId={projectId} surveyId={surveyId} />
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
