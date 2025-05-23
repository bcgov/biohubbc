import { mdiAttachment, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { FileUploadDialog } from 'components/dialog/attachments/FileUploadDialog';
import { SurveyRoleRouteGuard } from 'components/security/RouteGuards';
import { H2MenuToolbar } from 'components/toolbar/ActionToolbars';
import { SURVEY_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { SurveyContext } from 'contexts/surveyContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useContext, useState } from 'react';
import SurveyAttachmentsList from './SurveyAttachmentsList';

/**
 * Survey attachments component.
 *
 * @return {*}
 */
const SurveyAttachments = () => {
  const biohubApi = useBiohubApi();

  const surveyContext = useContext(SurveyContext);

  const { surveyId } = surveyContext;

  const [openUploadDialog, setOpenUploadDialog] = useState<'Attachment' | 'Report' | false>(false);

  const handleUploadAttachments = async (file: File) => {
    return biohubApi.survey.uploadSurveyAttachments(surveyId, file);
  };

  return (
    <>
      <FileUploadDialog
        open={openUploadDialog === 'Attachment'}
        dialogTitle="Upload Attachments"
        uploadHandler={handleUploadAttachments}
        onClose={() => {
          surveyContext.artifactDataLoader.refresh(surveyId);
          setOpenUploadDialog(false);
        }}
      />

      <H2MenuToolbar
        label="Attachments"
        buttonLabel="Upload"
        buttonTitle="Upload Attachments"
        buttonProps={{ variant: 'contained' }}
        buttonStartIcon={<Icon path={mdiTrayArrowUp} size={0.75} />}
        menuItems={[
          {
            menuLabel: 'Upload Attachments',
            menuIcon: <Icon path={mdiAttachment} size={1} />,
            menuOnClick: () => setOpenUploadDialog('Attachment')
          }
        ]}
        renderButton={(buttonProps) => (
          <SurveyRoleRouteGuard
            validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button {...buttonProps} />
          </SurveyRoleRouteGuard>
        )}
      />

      <Divider />

      <SurveyAttachmentsList />
    </>
  );
};

export default SurveyAttachments;
