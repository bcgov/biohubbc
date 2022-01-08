import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import { mdiMenuDown, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import FileUploadWithMetaDialog from 'components/dialog/FileUploadWithMetaDialog';
import { H2MenuToolbar } from 'components/toolbar/ActionToolbars';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse,
  IUploadAttachmentResponse
} from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { AttachmentType } from '../../../constants/attachments';

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
  const restorationTrackerApi = useRestorationTrackerApi();

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);
  const [attachmentType, setAttachmentType] = useState<AttachmentType.REPORT | AttachmentType.OTHER>(
    AttachmentType.OTHER
  );
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);

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
        const response = await restorationTrackerApi.project.getProjectAttachments(projectId);

        if (!response?.attachmentsList) {
          return;
        }

        setAttachmentsList([...response.attachmentsList]);
      } catch (error) {
        return error;
      }
    },
    [restorationTrackerApi.project, projectId, attachmentsList.length]
  );

  const getUploadHandler = (): IUploadHandler<IUploadAttachmentResponse> => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return restorationTrackerApi.project.uploadProjectAttachments(
        projectId,
        file,
        cancelToken,
        handleFileUploadProgress
      );
    };
  };

  const getFinishHandler = () => {
    return (fileMeta: IReportMetaForm) => {
      return restorationTrackerApi.project
        .uploadProjectReports(projectId, fileMeta.attachmentFile, fileMeta)
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
          buttonEndIcon={<Icon path={mdiMenuDown} size={1} />}
          menuItems={[
            { menuLabel: 'Upload Report', menuOnClick: handleUploadReportClick },
            { menuLabel: 'Upload Attachments', menuOnClick: handleUploadAttachmentClick }
          ]}
        />
        <Box px={3} pb={2}>
          <AttachmentsList projectId={projectId} attachmentsList={attachmentsList} getAttachments={getAttachments} />
        </Box>
      </Paper>
    </>
  );
};

export default ProjectAttachments;
