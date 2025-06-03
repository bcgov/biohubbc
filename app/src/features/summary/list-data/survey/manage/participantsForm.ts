import { ICollectionMember } from 'interfaces/useCollectionApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { useState } from 'react';

export interface ParticipantsFormState {
  participants: ICollectionMember[];
  errors: any;
}

export function useParticipantsForm(initialParticipants: any[] = []) {
  const [participants, setParticipants] = useState<any[]>(initialParticipants);
  const [errors, setErrors] = useState<any>({});

  const handleAddUser = (user: ISystemUser) => {
    setParticipants((prev) => [
      ...prev,
      {
        survey_member_id: 0,
        survey_role_id: 0,
        user_identifier: user.user_identifier ?? '',
        system_user_id: user.system_user_id,
        display_name: user.display_name,
        email: user.email,
        agency: user.agency,
        identity_source: user.identity_source,
        survey_role_name: ''
      }
    ]);
    clearErrors();
  };

  const handleAddUserRole = (role: string, index: number) => {
    setParticipants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], survey_role_name: role };
      return updated;
    });
    clearErrors();
  };

  const handleRemoveUser = (systemUserId: number) => {
    setParticipants((prev) => prev.filter((item) => item.system_user_id !== systemUserId));
    clearErrors();
  };

  const clearErrors = () => {
    setErrors((prev: any) => {
      const newErrors = { ...prev };
      delete newErrors.participants;
      return newErrors;
    });
  };

  const alertBarText = (): { title: string; text: string } => {
    let title = '';
    let text = '';
    if (errors?.participants) {
      if (Array.isArray(errors.participants)) {
        title = 'Missing Roles';
        text = 'All team members must be assigned a role.';
      } else {
        if (participants.length > 0) {
          title = 'A coordinator role is required';
        } else {
          title = 'Missing Team Member';
        }
        text = errors.participants;
      }
    }
    return { title, text };
  };

  const rowItemError = (index: number): string | undefined => {
    if (errors?.participants && Array.isArray(errors.participants)) {
      const errorAtIndex = errors.participants[index];
      if (errorAtIndex) {
        return 'Select a role for this team member.';
      }
    }
  };

  const getSelectedRole = (index: number): string => {
    return participants?.[index]?.survey_role_name || '';
  };

  return {
    participants,
    setParticipants,
    errors,
    setErrors,
    handleAddUser,
    handleAddUserRole,
    handleRemoveUser,
    clearErrors,
    alertBarText,
    rowItemError,
    getSelectedRole
  };
}
