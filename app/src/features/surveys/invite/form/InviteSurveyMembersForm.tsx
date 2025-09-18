import { Stack } from '@mui/material';
import Divider from '@mui/material/Divider';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { IPostSurveyMember } from 'interfaces/useSurveyApi.interface';
import { InviteSurveyMembersMemberForm } from './member/InviteSurveyMembersMemberForm';
import { InviteSurveyMembersSurveyForm } from './survey/InviteSurveyMembersSurveysForm';

export interface IManageUsersFormValues {
  selectedSurveys: number[];
  selectedMembers: IPostSurveyMember[];
}

const InviteSurveyMembersForm = () => {
  return (
    <Stack gap={5}>
      <FormikErrorSnackbar />
      <HorizontalSplitFormComponent
        title="Surveys"
        summary="Select the surveys you want to invite members to."
        component={<InviteSurveyMembersSurveyForm />}
      />
      <Divider />
      <HorizontalSplitFormComponent
        title="Invite Members"
        summary="Invite members to access your surveys. Any role you assign here will be applied to that member within every survey you have selected above."
        component={<InviteSurveyMembersMemberForm />}
      />
      <Divider />
    </Stack>
  );
};

export default InviteSurveyMembersForm;
