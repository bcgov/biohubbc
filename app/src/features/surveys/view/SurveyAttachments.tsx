import { Menu, MenuItem } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { mdiUploadOutline } from '@mdi/js';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import FileUploadWithMetaDialog from 'components/dialog/FileUploadWithMetaDialog';
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
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const [attachmentsList, setAttachmentsList] = useState<IGetSurveyAttachment[]>([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleUploadReportClick = (event: any) => {
    setAnchorEl(null);
    setIsUploadingReport(true);
    setOpenUploadAttachments(true);
  };
  const handleUploadAttachmentClick = (event: any) => {
    setAnchorEl(null);
    setIsUploadingReport(false);
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

  const getUploadHandler = (): IUploadHandler => {
    return (file, cancelToken, handleFileUploadProgress, fileType) => {
      return biohubApi.survey.uploadSurveyAttachments(
        projectId,
        surveyId,
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


  //TODO: need a hook for survey attachments

  const handleReportMeta = (fileMeta: IReportMetaForm) => {
    return biohubApi.project.updateProjectAttachmentMetadata(projectId, fileMeta.attachmentId, fileMeta);
  };

  return (
    <>
      <FileUploadWithMetaDialog
        open={openUploadAttachments}
        dialogTitle={isUploadingReport ? 'Upload Report' : 'Upload Attachment'}
        isUploadingReport={isUploadingReport}
        onFinish={handleReportMeta}
        onClose={() => {
          getAttachments(true);
          setOpenUploadAttachments(false);
        }}
        uploadHandler={getUploadHandler()}></FileUploadWithMetaDialog>
      <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h2">Project Attachments</Typography>
        <Box my={-1}>
          <Button
            color="primary"
            variant="outlined"
            aria-controls="basic-menu"
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            startIcon={<Icon path={mdiUploadOutline} size={1} />}
            onClick={handleClick}>
            Upload
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            getContentAnchorEl={null}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}>
            <MenuItem onClick={handleUploadReportClick}>Upload Report</MenuItem>
            <MenuItem onClick={handleUploadAttachmentClick}>Upload Attachment</MenuItem>
          </Menu>
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
