import { CreateButton } from 'components/buttons/CreateButton';

export const CreateSurveyButton = () => {
  return <CreateButton to={`/admin/surveys/create`} label="Create Survey" />;
};
