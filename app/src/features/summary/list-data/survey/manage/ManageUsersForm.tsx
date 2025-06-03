import { LoadingButton } from '@mui/lab';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import PageHeader from 'components/layout/PageHeader';
import UserRoleSelector from 'components/user/UserRoleSelector';
import { SURVEY_ROLE } from 'constants/roles';
import { CodesContext } from 'contexts/codesContext';
import { useParticipantsForm } from 'features/summary/list-data/survey/manage/participantsForm';
import { Formik, FormikProps } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { TransitionGroup } from 'react-transition-group';

/**
 * Form for inviting multiple users to multiple surveys.
 *
 * @return {*}
 */
const ManageUsersForm = ({
  formikRef,
  isSaving = false,
  handleCancel
}: {
  formikRef: React.RefObject<FormikProps<any>>;
  isSaving?: boolean;
  handleCancel?: () => void;
}) => {
  const history = useHistory();
  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data;
  const biohubApi = useBiohubApi();

  // Ensure codes are loaded before rendering
  useEffect(() => {
    if (!codes) {
      codesContext.codesDataLoader.load();
    }
  }, [codes, codesContext.codesDataLoader]);

  // Load all surveys
  const surveysDataLoader = useDataLoader(() =>
    biohubApi.survey.findSurveys(undefined, { survey_roles: [SURVEY_ROLE.ADMIN] })
  );

  useEffect(() => {
    surveysDataLoader.load();
  }, [surveysDataLoader]);

  // Prepare survey options for Autocomplete
  const surveyOptions = useMemo(() => {
    const surveys = surveysDataLoader.data?.surveys || [];
    return surveys.map((survey) => ({
      value: survey.survey_id as number,
      label: survey.name as string
    }));
  }, [surveysDataLoader.data?.surveys]);

  // Initial values: selectedSurveys and participants
  const initialValues = {
    selectedSurveys: [] as number[]
  };

  // Internal handleSubmit for bulk-assigning participants to selected surveys
  const handleSubmit = async (values: any) => {
    // Use the same logic as SurveyMembersForm for mapping participants, but only send what backend expects
    const validParticipants = (participants || [])
      .filter((p) => p.system_user_id && p.survey_role_name)
      .map((p) => ({
        system_user_id: p.system_user_id,
        survey_role_name: p.survey_role_name
      }));

    if (!validParticipants.length) {
      // Show an error if no participants with roles are present
      alert('Please invite a team member and assign them a role prior to submitting this form.');
      return;
    }

    try {
      // Bulk assign: add participants to all selected surveys using fetch with backend shape
      await Promise.all(
        (values.selectedSurveys || []).map((survey_id: number) =>
          fetch(`/api/survey/${survey_id}/participants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ participants: validParticipants })
          })
        )
      );
      history.push('/admin/summary');
    } catch (error) {
      // Optionally show an error to the user here
      console.error('Failed to add participants:', error);
    }
  };

  const {
    participants,
    errors,
    handleAddUser,
    handleAddUserRole,
    handleRemoveUser,
    alertBarText,
    rowItemError,
    getSelectedRole
  } = useParticipantsForm();

  if (!codes?.survey_roles) {
    return null; // or a loading spinner if preferred
  }

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
            enableReinitialize={true}
            onSubmit={handleSubmit}>
            {({ values, setFieldValue }) => (
              <Stack gap={5}>
                <FormikErrorSnackbar />
                {/* Top half: Survey selection */}
                <HorizontalSplitFormComponent
                  title="Surveys"
                  summary="Select the surveys you want to invite members to."
                  component={
                    <Autocomplete
                      multiple
                      id="selectedSurveys"
                      options={surveyOptions}
                      getOptionLabel={(option) => option.label}
                      value={surveyOptions.filter((option) =>
                        (values.selectedSurveys as number[]).includes(option.value)
                      )}
                      onChange={(_, newValue) =>
                        setFieldValue(
                          'selectedSurveys',
                          newValue.map((option) => option.value)
                        )
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Surveys"
                          placeholder="Search and select surveys"
                          required
                        />
                      )}
                      disableCloseOnSelect
                    />
                  }
                />
                <Divider />
                {/* Bottom half: User/role selection */}
                <HorizontalSplitFormComponent
                  title="Invite Members"
                  summary="Invite members to access your surveys. Any role you assign here will be applied to that member within every survey you have selected above."
                  component={
                    <Box component="fieldset">
                      {errors?.['participants'] && participants.length > 0 && (
                        <Box mt={3}>
                          <AlertBar
                            severity="error"
                            variant="standard"
                            title={alertBarText().title}
                            text={alertBarText().text}
                          />
                        </Box>
                      )}
                      <Box>
                        <SystemUserAutocompleteField
                          formikFieldName="system_user_id"
                          label="Member"
                          placeholder="Search by user"
                          helpText={`Only active users who have requested access to the Species Inventory Management System before can be invited`}
                          selectedUsers={participants.map((participant) => participant.system_user_id)}
                          clearOnSelect
                          onSelect={(value) => {
                            if (value) {
                              handleAddUser(value);
                            }
                          }}
                          key="project-user-filter"
                        />
                      </Box>
                      <Box>
                        <Box
                          sx={{
                            '& .userRoleItemContainer + .userRoleItemContainer': {
                              mt: 1
                            }
                          }}>
                          <TransitionGroup>
                            {participants.map((user, index: number) => {
                              const error = rowItemError(index);
                              return (
                                <Collapse
                                  key={
                                    'survey_member_id' in user
                                      ? `${user.survey_member_id}-${user.system_user_id}`
                                      : user.system_user_id
                                  }>
                                  <UserRoleSelector
                                    index={index}
                                    user={user}
                                    roles={codes.survey_roles}
                                    error={
                                      error ? (
                                        <Typography style={{ fontSize: '12px', color: '#f44336' }}>{error}</Typography>
                                      ) : undefined
                                    }
                                    selectedRole={getSelectedRole(index)}
                                    handleAdd={handleAddUserRole}
                                    handleRemove={handleRemoveUser}
                                    key={user.system_user_id}
                                    label={'Select a Role'}
                                  />
                                </Collapse>
                              );
                            })}
                          </TransitionGroup>
                        </Box>
                      </Box>
                    </Box>
                  }
                />
                <Divider />
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
                    onClick={handleCancel ? handleCancel : () => history.push('/admin/summary')}>
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            )}
          </Formik>
        </Paper>
      </Container>
    </>
  );
};

export default ManageUsersForm;
