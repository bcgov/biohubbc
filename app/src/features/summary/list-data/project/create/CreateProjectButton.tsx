import { CreateButton } from 'components/buttons/CreateButton';

export const CreateProjectButton = () => {
  return <CreateButton to={`/admin/projects/create`} label="Create Project" />;
};
