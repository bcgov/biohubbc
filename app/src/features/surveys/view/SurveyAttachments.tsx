import { mdiAttachment, mdiFilePdfBox, mdiFolderKeyOutline, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import FileUploadWithMetaDialog from 'components/dialog/attachments/FileUploadWithMetaDialog';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { ProjectRoleGuard } from 'components/security/Guards';
import { H2MenuToolbar } from 'components/toolbar/ActionToolbars';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
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
  const [attachmentType, setAttachmentType] = useState<
    AttachmentType.REPORT | AttachmentType.OTHER | AttachmentType.KEYX | AttachmentType.CFG
  >(AttachmentType.OTHER);

  const handleUploadReportClick = () => {
    setAttachmentType(AttachmentType.REPORT);
    setOpenUploadAttachments(true);
  };

  const handleUploadKeyxClick = () => {
    setAttachmentType(AttachmentType.KEYX);
    setOpenUploadAttachments(true);
  };

  const handleUploadAttachmentClick = () => {
    setAttachmentType(AttachmentType.OTHER);
    setOpenUploadAttachments(true);
  };

  const getUploadHandler = (): IUploadHandler => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return attachmentType === AttachmentType.KEYX
        ? biohubApi.survey.uploadSurveyKeyx(projectId, surveyId, file, cancelToken, handleFileUploadProgress)
        : biohubApi.survey.uploadSurveyAttachments(projectId, surveyId, file, cancelToken, handleFileUploadProgress);
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

  const getDialogTitle = () => {
    switch (attachmentType) {
      case AttachmentType.REPORT:
        return 'Upload Report';
      case AttachmentType.KEYX:
        return 'Upload KeyX';
      case AttachmentType.CFG:
        return 'Upload Cfg';
      case AttachmentType.OTHER:
        return 'Upload Attachments';
      default:
        return '';
    }
  };

  return (
    <>
      <FileUploadWithMetaDialog
        open={openUploadAttachments}
        dialogTitle={getDialogTitle()}
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
          buttonProps={{ variant: 'contained' }}
          buttonStartIcon={<Icon path={mdiTrayArrowUp} size={0.75} />}
          menuItems={[
            {
              menuLabel: 'Upload a Report',
              menuIcon: <Icon path={mdiFilePdfBox} size={1} />,
              menuOnClick: handleUploadReportClick
            },
            {
              menuLabel: 'Upload KeyX Files',
              menuIcon: <Icon path={mdiFolderKeyOutline} size={1} />,
              menuOnClick: handleUploadKeyxClick
            },
            {
              menuLabel: 'Upload Attachments',
              menuIcon: <Icon path={mdiAttachment} size={1} />,
              menuOnClick: handleUploadAttachmentClick
            }
          ]}
          renderButton={(buttonProps) => (
            <ProjectRoleGuard
              validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
              validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <Button {...buttonProps} />
            </ProjectRoleGuard>
          )}
        />
        <Divider></Divider>
        <Box p={2}>
          <SurveyAttachmentsList />
        </Box>
      </Box>
    </>
  );
};

export default SurveyAttachments;
