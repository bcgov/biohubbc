import { Box, Button, Divider } from '@material-ui/core';
import { mdiAttachment, mdiFilePdfBox, mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import { ProjectRoleGuard } from 'components/security/Guards';
import { H2MenuToolbar } from 'components/toolbar/ActionToolbars';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import React from 'react';
import NoSurveySectionData from '../components/NoSurveySectionData';

const SurveyAnimals: React.FC = () => {
  const handleUploadReportClick = () => {
    //;
  };
  const handleUploadAttachmentClick = () => {
    //;
  };

  return (
    <Box>
      <H2MenuToolbar
        label="Individual Animals"
        buttonLabel="Upload"
        buttonTitle="Upload Animals"
        buttonProps={{ variant: 'contained', disableElevation: true }}
        buttonStartIcon={<Icon path={mdiTrayArrowUp} size={1} />}
        menuItems={[
          {
            menuLabel: 'Upload Individual',
            menuIcon: <Icon path={mdiFilePdfBox} size={1} />,
            menuOnClick: handleUploadReportClick
          },
          {
            menuLabel: 'Upload Bulk',
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
        <NoSurveySectionData text={'No Individual Animals'} paperVariant={'outlined'} />
      </Box>
    </Box>
  );
};
export default SurveyAnimals;
