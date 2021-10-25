import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiMenuDown, mdiUpload } from '@mdi/js';
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

const useStyles = makeStyles((theme: Theme) => ({
  uploadMenu: {
    marginTop: theme.spacing(1)
  }
}));

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
  const classes = useStyles();
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];
  const biohubApi = useBiohubApi();

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);
  const [attachmentType, setAttachmentType] = useState<'Report' | 'Other'>('Other');
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
    setAttachmentType('Report');
    setOpenUploadAttachments(true);
  };
  const handleUploadAttachmentClick = (event: any) => {
    setAnchorEl(null);
    setAttachmentType('Other');
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

  const handleReportMeta = (fileMeta: IReportMetaForm, revisionCount: number) => {
    return biohubApi.survey.updateSurveyAttachmentMetadata(
      projectId,
      surveyId,
      fileMeta.attachmentId,
      attachmentType,
      fileMeta,
      revisionCount
    );
  };

  return (
    <>
      <FileUploadWithMetaDialog
        open={openUploadAttachments}
        dialogTitle={attachmentType ? 'Upload Report' : 'Upload Attachment'}
        attachmentType={attachmentType}
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
            startIcon={<Icon path={mdiUpload} size={1} />}
            endIcon={<Icon path={mdiMenuDown} size={1} />}
            onClick={handleClick}>
            Upload
          </Button>
          <Menu
            className={classes.uploadMenu}
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button'
            }}>
            <MenuItem onClick={handleUploadReportClick}>Upload Report</MenuItem>
            <MenuItem onClick={handleUploadAttachmentClick}>Upload Attachments</MenuItem>
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
