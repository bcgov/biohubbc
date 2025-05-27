import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { CodesContext } from 'contexts/codesContext';
import { Formik, FormikProps } from 'formik';
import { ISurveyMember} from 'interfaces/useSurveyApi.interface';
import { useContext } from 'react';
import ParticipantsCollectionForm from 'features/collection/edit/participants/ParticipantsCollectionForm';
import { useAllSurveys } from 'hooks/useAllSurveys';

interface ISurveyUsersForm<InitialValuesType extends ISurveyMember> {
  inviteMembers: InitialValuesType;
  handleSubmit: (formikData: InitialValuesType) => void;
  formikRef: React.RefObject<FormikProps<InitialValuesType>>;
}
/**
 * Form for inviting multiple users to multiple surveys.
 *
 * @return {*}
 */
const ManageUsersForm = <InitialValuesType extends ISurveyMember>(
  props: ISurveyUsersForm<InitialValuesType>
) => {
  const { formikRef } = props;

  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data;

  useAllSurveys();

  const handleSubmit = async (formikData: InitialValuesType) => {
    props.handleSubmit(formikData);
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={props.inviteMembers}
      validateOnBlur={false}
      validateOnChange={false}
      enableReinitialize={true}
      onSubmit={handleSubmit}>
      <Stack gap={5}>
        <FormikErrorSnackbar />
        <HorizontalSplitFormComponent
          title="Members"
          summary="Invite members to access your surveys. Any individual role you assign here will apply to each member in every survey you have selected."
          component={<ParticipantsCollectionForm roles={codes?.survey_roles ?? []} />}
        />

        <Divider />
      </Stack>
    </Formik>
  );
};

export default ManageUsersForm;
