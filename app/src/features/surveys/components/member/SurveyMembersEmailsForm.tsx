import { mdiClose, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import grey from '@mui/material/colors/grey';
import AlertBar from 'components/alert/AlertBar';
import CustomTextField from 'components/fields/CustomTextField';
import { useFormikContext } from 'formik';
import { ICodeWithDescription } from 'interfaces/useCodesApi.interface';
import { ICreateSurveyRequest } from 'interfaces/useSurveyApi.interface';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';

export const SurveyMembersEmailYupSchema = yup.object().shape({
  members: yup.array().of(
    yup.object().shape({
      email: yup.string().trim().email('Must be a valid email address').required('A valid email address is required'),
      survey_role_name: yup.string().required('Select a survey role for this team member')
    })
  )
});

interface ISurveyMembersEmailFormProps {
  roles: ICodeWithDescription[];
}

export const SurveyMembersFormInitialValues = {
  members: [
    {
      email: '',
      survey_role_name: ''
    }
  ]
};

interface IMemberEmailRole {
  email: string;
  survey_role_name: string;
}

/**
 * Form for adding members to a survey by email, granting them permissions to view the survey
 *
 * @param {ISurveyMembersEmailFormProps} props
 */
export const SurveyMembersEmailsForm = (props: ISurveyMembersEmailFormProps) => {
  const { handleSubmit, values, setFieldValue, errors, setErrors } = useFormikContext<ICreateSurveyRequest>();

  const handleAddMember = () => {
    const newMember: IMemberEmailRole = {
      email: '',
      survey_role_name: ''
    };
    setFieldValue(`members[${values.members.length}]`, newMember);
    clearErrors();
  };

  const handleUpdateEmail = (email: string, index: number) => {
    setFieldValue(`members[${index}].email`, email);
    clearErrors();
  };

  const handleUpdateRole = (survey_role_name: string, index: number) => {
    setFieldValue(`members[${index}].survey_role_name`, survey_role_name);
    clearErrors();
  };

  const handleRemoveMember = (index: number) => {
    const filteredMembers = values.members.filter((_, memberIndex) => memberIndex !== index);
    setFieldValue(`members`, filteredMembers);
    clearErrors();
  };

  const clearErrors = () => {
    setErrors({ ...errors, members: undefined });
  };

  const rowItemError = (index: number): JSX.Element | undefined => {
    if (errors?.members && Array.isArray(errors.members)) {
      const errorAtIndex = errors.members[index];
      if (errorAtIndex) {
        return (
          <Typography style={{ fontSize: '12px', color: '#f44336' }}>
            {typeof errorAtIndex === 'string'
              ? errorAtIndex
              : errorAtIndex.email || errorAtIndex.survey_role_name || 'Please fix the errors above.'}
          </Typography>
        );
      }
    }
  };

  const getSelectedRole = (index: number): string => {
    return values.members?.[index]?.survey_role_name || '';
  };

  return (
    <form onSubmit={handleSubmit}>
      {errors?.['members'] && !Array.isArray(errors['members']) && (
        <Box my={3}>
          <AlertBar severity="error" variant="outlined" title="Missing Invites" text={errors['members']} />
        </Box>
      )}

      <Box mb={2}>
        <Button
          variant="outlined"
          startIcon={<Icon path={mdiPlus} size={1} />}
          onClick={handleAddMember}
          sx={{ mb: 2 }}>
          Add Member
        </Button>
      </Box>

      <Box>
        <Box
          sx={{
            '& .memberItemContainer + .memberItemContainer': {
              mt: 1
            }
          }}>
          <TransitionGroup>
            {values.members.map((member: IMemberEmailRole, index: number) => {
              const error = rowItemError(index);
              return (
                <Collapse key={`member-${index}`}>
                  <Box mt={1} className="memberItemContainer">
                    <Paper
                      variant="outlined"
                      sx={{
                        background: grey[100],
                        ...(error
                          ? {
                              '& + p': {
                                pt: 0.75,
                                pb: 0.75,
                                pl: 2
                              }
                            }
                          : undefined)
                      }}>
                      <Box display="flex" alignItems="center" px={2} py={1.5} gap={2}>
                        <Box flex="1 1 auto">
                          <CustomTextField
                            name={`members[${index}].email`}
                            label="Email Address"
                            placeholder="Enter email address"
                            other={{
                              type: 'email',
                              value: member.email,
                              onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                                handleUpdateEmail(event.target.value, index);
                              }
                            }}
                          />
                        </Box>
                        <Box flex="0 0 auto" minWidth="200px">
                          <Select
                            size="small"
                            inputProps={{
                              'aria-label': 'Select a role'
                            }}
                            error={Boolean(error)}
                            data-testid={`select-member-role-button-${index}`}
                            sx={{ width: '100%', backgroundColor: '#fff' }}
                            displayEmpty
                            value={getSelectedRole(index)}
                            onChange={(event) => {
                              handleUpdateRole(String(event.target.value), index);
                            }}
                            renderValue={(selected) => {
                              if (!selected) {
                                return 'Select a Role';
                              }
                              return selected;
                            }}>
                            {props.roles.map((item) => (
                              <MenuItem
                                key={item.id}
                                value={item.name}
                                sx={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'flex-start'
                                }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>{item.name}</Box>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {item.description}
                                </Typography>
                              </MenuItem>
                            ))}
                          </Select>
                        </Box>
                        <Box flex="0 0 auto">
                          <IconButton
                            data-testid={`remove-member-button-${index}`}
                            sx={{ ml: 1 }}
                            aria-label="remove member"
                            onClick={() => {
                              handleRemoveMember(index);
                            }}>
                            <Icon path={mdiClose} size={1} />
                          </IconButton>
                        </Box>
                      </Box>
                    </Paper>
                    {error}
                  </Box>
                </Collapse>
              );
            })}
          </TransitionGroup>
        </Box>
      </Box>
    </form>
  );
};
