import { CreateButton } from 'components/buttons/CreateButton';

export const CreateCollectionButton = () => {
  return <CreateButton to={`/admin/collections/create`} label="Create Collection" />;
};
