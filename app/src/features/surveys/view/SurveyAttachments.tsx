import { mdiAttachment, mdiFilePdfBox, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import FileUploadWithMetaDialog from 'components/dialog/attachments/FileUploadWithMetaDialog';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { ProjectRoleGuard } from 'components/security/Guards';
import { H2MenuToolbar } from 'components/toolbar/ActionToolbars';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useContext, useState } from 'react';
import { AttachmentType } from '../../../constants/attachments';
import SurveyAttachmentsList from './SurveyAttachmentsList';

const SurveyAttachments: React.FC = () => {
  const biohubApi = useBiohubApi();

  const surveyContext = useContext(SurveyContext);

  const { projectId, surveyId } = surveyContext;

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);
  const [attachmentType, setAttachmentType] = useState<AttachmentType.REPORT | AttachmentType.OTHER>(
    AttachmentType.OTHER
  );

  const handleUploadReportClick = () => {
    setAttachmentType(AttachmentType.REPORT);
    setOpenUploadAttachments(true);
  };

  const handleUploadAttachmentClick = () => {
    setAttachmentType(AttachmentType.OTHER);
    setOpenUploadAttachments(true);
  };

  const getUploadHandler = (): IUploadHandler => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return biohubApi.survey.uploadSurveyAttachments(projectId, surveyId, file, cancelToken, handleFileUploadProgress);
    };
  };

  const getFinishHandler = () => {
    return async (fileMeta: IReportMetaForm) => {
      return biohubApi.survey
        .uploadSurveyReports(projectId, surveyId, fileMeta.attachmentFile, fileMeta)
        .finally(() => {
          setOpenUploadAttachments(false);
        });
    };
  };

  return (
    <>
      <FileUploadWithMetaDialog
        open={openUploadAttachments}
        dialogTitle={attachmentType === 'Report' ? 'Upload Report' : 'Upload Attachments'}
        attachmentType={attachmentType}
        onFinish={getFinishHandler()}
        onClose={() => {
          setOpenUploadAttachments(false);
          surveyContext.artifactDataLoader.refresh(projectId, surveyId);
        }}
        uploadHandler={getUploadHandler()}
      />
      <Box>
        <H2MenuToolbar
          label="Documents"
          buttonLabel="Upload"
          buttonTitle="Upload Documents"
          buttonProps={{ variant: 'contained', disableElevation: true }}
          buttonStartIcon={<Icon path={mdiTrayArrowUp} size={1} />}
          menuItems={[
            {
              menuLabel: 'Upload a Report',
              menuIcon: <Icon path={mdiFilePdfBox} size={1} />,
              menuOnClick: handleUploadReportClick
            },
            {
              menuLabel: 'Upload Attachments',
              menuIcon: <Icon path={mdiAttachment} size={1} />,
              menuOnClick: handleUploadAttachmentClick
            }
          ]}
          renderButton={(buttonProps) => (
            <ProjectRoleGuard
              validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <Button {...buttonProps} />
            </ProjectRoleGuard>
          )}
        />
        <Divider></Divider>
        <Box p={3}>
          <Paper variant="outlined">
            <SurveyAttachmentsList />
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default SurveyAttachments;
