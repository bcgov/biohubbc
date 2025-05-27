import React, { useRef } from 'react';
import { DialogContextProvider } from 'contexts/dialogContext';
import { CodesContextProvider } from 'contexts/codesContext';
import ManageUsersForm from 'features/summary/list-data/survey/manage/ManageUsersForm';
import { ISurveyMember } from 'interfaces/useSurveyApi.interface';

const inviteMembers: ISurveyMember = {
  survey_member_id: 0,
  system_user_id: 0,
  survey_role_id: 0,
  survey_role_name: '',
  identity_source: '',
  user_identifier: '',
  email: '',
  display_name: '',
  agency: ''
};

const InviteRouter: React.FC = () => {
  const formikRef = useRef(null);

  const handleSubmit = (data: ISurveyMember) => {
    // Implement invite logic here
    console.log('Inviting users:', data);
  };

  return (
    <DialogContextProvider>
      <CodesContextProvider>
        <ManageUsersForm
          inviteMembers={inviteMembers}
          handleSubmit={handleSubmit}
          formikRef={formikRef}
        />
      </CodesContextProvider>
    </DialogContextProvider>
  );
};

export default InviteRouter;
