import { Menu, MenuItem } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiMenuDown, mdiUpload } from '@mdi/js';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import FileUploadWithMetaDialog from 'components/dialog/FileUploadWithMetaDialog';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment, IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';

const useStyles = makeStyles((theme: Theme) => ({
  uploadMenu: {
    marginTop: theme.spacing(1)
  }
}));

export interface IProjectAttachmentsProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Project attachments content for a project.
 *
 * @return {*}
 */
const ProjectAttachments: React.FC<IProjectAttachmentsProps> = () => {
  const classes = useStyles();
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const biohubApi = useBiohubApi();

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);
  const [isUploadingReport, setIsUploadingReport] = useState(false);
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);

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
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
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
        <AttachmentsList projectId={projectId} attachmentsList={attachmentsList} getAttachments={getAttachments} />
      </Box>
    </>
  );
};

export default ProjectAttachments;
