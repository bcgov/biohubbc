import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { mdiAttachment, mdiChevronDown, mdiFilePdfBox, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import FileUploadWithMetaDialog from 'components/dialog/attachments/FileUploadWithMetaDialog';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { useBiohubApi } from 'hooks/useBioHubApi';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse,
  IGetProjectReportAttachment,
  IUploadAttachmentResponse
} from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { AttachmentType } from '../../../constants/attachments';

export interface IProjectAttachmentsProps {
  projectForViewData: IGetProjectForViewResponse;
}

export interface IAttachmentType {
  id: number;
  type: 'Report' | 'Other';
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
  const [attachmentType, setAttachmentType] = useState<AttachmentType.REPORT | AttachmentType.OTHER>(
    AttachmentType.OTHER
  );
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);
  const [reportAttachmentsList, setReportAttachmentsList] = useState<IGetProjectReportAttachment[]>([]);

  // Tracks which attachment rows have been selected, via the table checkboxes.
  const [selectedAttachmentRows, setSelectedAttachmentRows] = useState<IAttachmentType[]>([]);

  const handleUploadReportClick = () => {
    setAttachmentType(AttachmentType.REPORT);
    setOpenUploadAttachments(true);
  };
  const handleUploadAttachmentClick = () => {
    setAttachmentType(AttachmentType.OTHER);
    setOpenUploadAttachments(true);
  };

  const getAttachments = useCallback(
    async (forceFetch: boolean): Promise<IGetProjectAttachment[] | undefined> => {
      if (attachmentsList.length && !forceFetch) {
        return;
      }

      try {
        const response = await biohubApi.project.getProjectAttachments(projectId);

        if (!response?.attachmentsList && !response?.reportAttachmentsList) {
          return;
        }

        setReportAttachmentsList([...response.reportAttachmentsList]);
        setAttachmentsList([...response.attachmentsList]);

        return [...response.reportAttachmentsList, ...response.attachmentsList];
      } catch (error) {
        return;
      }
    },
    [biohubApi.project, projectId, attachmentsList.length]
  );

  const getUploadHandler = (): IUploadHandler<IUploadAttachmentResponse> => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return biohubApi.project.uploadProjectAttachments(projectId, file, cancelToken, handleFileUploadProgress);
    };
  };

  const getFinishHandler = () => {
    return (fileMeta: IReportMetaForm) => {
      return biohubApi.project.uploadProjectReports(projectId, fileMeta.attachmentFile, fileMeta).finally(() => {
        setOpenUploadAttachments(false);
      });
    };
  };

  useEffect(() => {
    getAttachments(false);
    // eslint-disable-next-line
  }, []);

  // Show/Hide Project Settings Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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

      {/* Need to use the regular toolbar in lieu of these action toolbars given it doesn't support multiple buttons */}
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h2">
          Documents
        </Typography>
        <Box>
          <Button
            color="primary"
            variant="contained"
            endIcon={<Icon path={mdiChevronDown} size={1} />}
            aria-controls="simple-menu"
            aria-haspopup="true"
            startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
            onClick={handleClick}>
            Add Documents
          </Button>
          <Menu
            style={{ marginTop: '8px' }}
            id="attachmentsMenu"
            anchorEl={anchorEl}
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}>
            <MenuItem onClick={handleUploadReportClick}>
              <ListItemIcon>
                <Icon path={mdiFilePdfBox} size={1} />
              </ListItemIcon>
              <Typography variant="inherit">Add Report</Typography>
            </MenuItem>
            <MenuItem onClick={handleUploadAttachmentClick}>
              <ListItemIcon>
                <Icon path={mdiAttachment} size={1} />
              </ListItemIcon>
              <Typography variant="inherit">Add Attachments</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
      <Divider></Divider>
      <Box px={1}>
        <AttachmentsList
          projectId={projectId}
          attachmentsList={[...attachmentsList, ...reportAttachmentsList]}
          getAttachments={getAttachments}
          selectedAttachments={selectedAttachmentRows}
          onCheckAllChange={(items) => setSelectedAttachmentRows(items)}
          onCheckboxChange={(value, add) => {
            const found = selectedAttachmentRows.findIndex((item) => item.id === value.id && item.type === value.type);
            const updated = [...selectedAttachmentRows];
            if (found < 0 && add) {
              updated.push(value);
            } else if (found >= 0 && !add) {
              updated.splice(found, 1);
            }
            setSelectedAttachmentRows(updated);
          }}
        />
      </Box>
    </>
  );
};

export default ProjectAttachments;
