import Paper from '@material-ui/core/Paper';
import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import FileUploadWithMetaDialog from 'components/dialog/FileUploadWithMetaDialog';
import { H2MenuToolbar } from 'components/toolbar/ActionToolbars';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse, IUploadAttachmentResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyAttachment, IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { AttachmentType } from '../../../constants/attachments';

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
  const [attachmentType, setAttachmentType] = useState<AttachmentType.REPORT | AttachmentType.OTHER>(
    AttachmentType.OTHER
  );
  const [attachmentsList, setAttachmentsList] = useState<IGetSurveyAttachment[]>([]);

  const handleUploadReportClick = () => {
    setAttachmentType(AttachmentType.REPORT);
    setOpenUploadAttachments(true);
  };
  const handleUploadAttachmentClick = () => {
    setAttachmentType(AttachmentType.OTHER);
    setOpenUploadAttachments(true);
  };

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

  const getUploadHandler = (): IUploadHandler<IUploadAttachmentResponse> => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return biohubApi.survey.uploadSurveyAttachments(
        projectId,
        surveyId,
        file,
        attachmentType,
        undefined,
        cancelToken,
        handleFileUploadProgress
      );
    };
  };

  const getFinishHandler = () => {
    return (fileMeta: IReportMetaForm) => {
      return biohubApi.survey
        .uploadSurveyAttachments(projectId, surveyId, fileMeta.attachmentFile, attachmentType, fileMeta)
        .finally(() => {
          setOpenUploadAttachments(false);
        });
    };
  };

  useEffect(() => {
    getAttachments(false);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      <FileUploadWithMetaDialog
        open={openUploadAttachments}
        dialogTitle={attachmentType === 'Report' ? 'Upload Report' : 'Upload Attachment'}
        attachmentType={attachmentType}
        onFinish={getFinishHandler()}
        onClose={() => {
          setOpenUploadAttachments(false);
          getAttachments(true);
        }}
        uploadHandler={getUploadHandler()}
      />
      <Paper>
        <H2MenuToolbar
          label="Documents"
          buttonLabel="Upload"
          buttonTitle="Upload Document"
          buttonStartIcon={<Icon path={mdiTrayArrowUp} size={1} />}
          menuItems={[
            { menuLabel: 'Upload Report', menuOnClick: handleUploadReportClick },
            { menuLabel: 'Upload Attachments', menuOnClick: handleUploadAttachmentClick }
          ]}
        />
        <AttachmentsList
          projectId={projectId}
          surveyId={surveyId}
          attachmentsList={attachmentsList}
          getAttachments={getAttachments}
        />
      </Paper>
    </>
  );
};

export default SurveyAttachments;
