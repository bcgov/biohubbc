import { CreateButton } from 'components/buttons/CreateButton';

export const ManageUsersButton = () => {
  return <CreateButton to={`app/src/features/summary/list-data/survey/manage/ManageUsersForm.tsx`} label="Team members" />;
};
