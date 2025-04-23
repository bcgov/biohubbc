import { CreateButton } from 'components/buttons/CreateButton';

interface ICreateSurveyButtonProps {
  projectId: number;
}
export const CreateSurveyButton = (props: ICreateSurveyButtonProps) => {
  const { projectId } = props;

  return <CreateButton to={`/admin/projects/${projectId}/surveys/create`} label="Create Survey" />;
};
