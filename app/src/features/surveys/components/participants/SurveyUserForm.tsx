import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import UserRoleSelector from 'components/user/UserRoleSelector';
import { useFormikContext } from 'formik';
import { ICodeWithDescription } from 'interfaces/useCodesApi.interface';
import { ICreateSurveyRequest, IGetSurveyParticipant } from 'interfaces/useSurveyApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';

export const SurveyParticipantsJobYupSchema = yup.object().shape({
  participants: yup.array().of(
    yup.object().shape({
      system_user_id: yup.string().required('Username is required'),
      survey_job_name: yup.string().required('Select a survey job for this team member')
    })
  )
});

interface ISurveyParticipantsFormProps {
  jobs: ICodeWithDescription[];
}

export const SurveyParticipantsJobFormInitialValues = {
  participants: []
};

/**
 * Form for adding users to a survey.
 *
 * @param {ISurveyParticipantsFormProps} props
 */
const SurveyParticipantsForm = (props: ISurveyParticipantsFormProps) => {
  const { handleSubmit, values, setFieldValue, errors, setErrors } = useFormikContext<ICreateSurveyRequest>();

  const handleAddUser = (user: ISystemUser | IGetSurveyParticipant) => {
    setFieldValue(`participants[${values.participants.length}]`, {
      system_user_id: user.system_user_id,
      display_name: user.display_name,
      email: user.email,
      agency: user.agency,
      identity_source: user.identity_source,
      survey_job_name: ''
    });
    clearErrors();
  };

  const handleAddUserRole = (survey_job_name: string, index: number) => {
    setFieldValue(`participants[${index}].survey_job_name`, survey_job_name);
    clearErrors();
  };

  const handleRemoveUser = (systemUserId: number) => {
    const filteredUsers = values.participants.filter(
      (item: ISystemUser | IGetSurveyParticipant) => item.system_user_id !== systemUserId
    );

    setFieldValue(`participants`, filteredUsers);
    clearErrors();
  };

  const clearErrors = () => {
    setErrors({ ...errors, participants: undefined });
  };

  const alertBarText = (): { title: string; text: string } => {
    let title = '';
    let text = '';
    if (errors?.participants && Array.isArray(errors.participants)) {
      title = 'Missing Jobs';
      text = 'All team members must be assigned a survey job.';
    }

    return { title, text };
  };

  const rowItemError = (index: number): JSX.Element | undefined => {
    if (errors?.participants && Array.isArray(errors.participants)) {
      const errorAtIndex = errors.participants[index];
      if (errorAtIndex) {
        return (
          <Typography style={{ fontSize: '12px', color: '#f44336' }}>
            {errorAtIndex ? 'Select a survey job for this team member.' : ''}
          </Typography>
        );
      }
    }
  };

  const getSelectedRole = (index: number): string => {
    // users should only ever have a single role on a project so index: 0 is a safe selection
    return values.participants?.[index]?.survey_job_name || '';
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors?.['participants'] && values.participants.length > 0 && (
        <Box mt={3}>
          <AlertBar severity="error" variant="outlined" title={alertBarText().title} text={alertBarText().text} />
        </Box>
      )}
      <SystemUserAutocompleteField
        formikFieldName="participants"
        label="Participants"
        helpText="Only active users who have requested access to the Species Inventory Management System before can be invited"
        selectedUsers={values.participants.map((participant) => participant.system_user_id)}
        clearOnSelect
        onSelect={(value) => {
          if (value) {
            handleAddUser(value);
          }
        }}
      />
      <Box>
        <Box
          sx={{
            '& .userRoleItemContainer + .userRoleItemContainer': {
              mt: 1
            }
          }}>
          <TransitionGroup>
            {values.participants.map((user: ISystemUser | IGetSurveyParticipant, index: number) => {
              const error = rowItemError(index);
              return (
                <Collapse key={user.system_user_id}>
                  <UserRoleSelector
                    index={index}
                    user={user}
                    roles={props.jobs}
                    error={error}
                    selectedRole={getSelectedRole(index)}
                    handleAdd={handleAddUserRole}
                    handleRemove={handleRemoveUser}
                    label="Select a Job"
                  />
                </Collapse>
              );
            })}
          </TransitionGroup>
        </Box>
      </Box>
    </form>
  );
};

export default SurveyParticipantsForm;
