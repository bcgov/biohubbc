import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import PageHeader from 'components/layout/PageHeader';
import { SURVEY_ROLE } from 'constants/roles';
import { Formik, FormikProps } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useRef, useState } from 'react';
import { useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import InviteSurveyMembersForm, { IManageUsersFormValues } from './form/InviteSurveyMembersForm';

const initialValues: IManageUsersFormValues = {
  selectedSurveys: [],
  selectedMembers: []
};

export interface ITrimmedSurveyMember {
  survey_role_name: SURVEY_ROLE;
  system_user_id: number;
}

export interface ITrimmedPayload {
  selectedSurveys: number[];
  selectedMembers: ITrimmedSurveyMember[];
}

const manageUsersYupSchema = yup.object().shape({
  selectedSurveys: yup.array(yup.number()).min(1, 'You must select at least one survey.'),
  selectedMembers: yup
    .array(yup.object().shape({ system_user_id: yup.number(), collection_role_name: yup.string() }))
    .min(1, 'Invite a team member and assign them a role.')
});

/**
 * Page for bulk adding members to surveys
 *
 * @return {*}
 */
export const InviteSurveyMembersPage: React.FC = () => {
  const biohubApi = useBiohubApi();
  const history = useHistory();
  const formikRef = useRef<FormikProps<IManageUsersFormValues>>(null);
  const [isSaving] = useState(false);
  const handleSubmit = async (values: IManageUsersFormValues) => {
    const trimMembers: ITrimmedSurveyMember[] = values.selectedMembers.map((member) => ({
      survey_role_name: member.survey_role_name,
      system_user_id: member.system_user_id
    }));

    const payload: ITrimmedPayload = {
      selectedSurveys: values.selectedSurveys,
      selectedMembers: trimMembers
    };

    await biohubApi.surveyMembers.addBulkSurveysMembers(payload);
    history.push('/admin/summary');
  };

  return (
    <>
      <PageHeader title="Manage Users" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper sx={{ p: 5 }}>
          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validateOnBlur={false}
            validateOnChange={false}
            validationSchema={manageUsersYupSchema}
            enableReinitialize={true}
            onSubmit={handleSubmit}>
            <InviteSurveyMembersForm />
          </Formik>
          <Stack mt={4} flexDirection="row" justifyContent="flex-end" gap={1}>
            <LoadingButton
              loading={isSaving}
              type="submit"
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}
              data-testid="submit-manage-users-button">
              Save and Exit
            </LoadingButton>
            <Button
              disabled={isSaving}
              color="primary"
              variant="outlined"
              onClick={() => history.push('/admin/summary')}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      </Container>
    </>
  );
};
