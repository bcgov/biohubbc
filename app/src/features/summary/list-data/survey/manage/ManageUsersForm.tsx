import { LoadingButton } from '@mui/lab';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import PageHeader from 'components/layout/PageHeader';
import { SURVEY_ROLE } from 'constants/roles';
import { CodesContext } from 'contexts/codesContext';
import { Formik, FormikProps } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { IPostSurveyMember } from 'interfaces/useSurveyApi.interface';
import React, { useContext, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import yup from 'utils/YupSchema';

export interface IManageUsersFormValues {
  selectedSurveys: number[];
  selectedMembers: IPostSurveyMember[];
}

const initialValues: IManageUsersFormValues = {
  selectedSurveys: [],
  selectedMembers: []
};

const manageUsersYupSchema = yup.object().shape({
  selectedSurveys: yup.array(yup.number()).min(1, 'You must select at least one survey.'),
  selectedMembers: yup
    .array(yup.object().shape({ system_user_id: yup.number(), collection_role_name: yup.string() }))
    .min(1, 'Invite a team member and assign them a role.')
});

// const handleAddUser = (user: ISystemUser) => {
//   setParticipants((prev) => [
//     ...prev,
//     {
//       survey_member_id: 0,
//       survey_role_id: 0,
//       user_identifier: user.user_identifier ?? '',
//       system_user_id: user.system_user_id,
//       display_name: user.display_name,
//       email: user.email,
//       agency: user.agency,
//       identity_source: user.identity_source,
//       survey_role_name: ''
//     }
//   ]);
//   clearErrors();
// };

// const handleAddUserRole = (role: string, index: number) => {
//   setParticipants((prev) => {
//     const updated = [...prev];
//     updated[index] = { ...updated[index], survey_role_name: role };
//     return updated;
//   });
//   clearErrors();
// };

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
  const dialogContext = useDialogContext();

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
      value: survey.survey_id,
      label: survey.name
    }));
  }, [surveysDataLoader.data?.surveys]);

  // Internal handleSubmit for bulk-assigning participants to selected surveys
  const handleSubmit = async (values: IManageUsersFormValues) => {
    try {
      await biohubApi.survey.addBulkSurveysMembers(values);
      dialogContext.setSnackbar({ open: true, snackbarMessage: 'Members added successfully.' });
      history.push('/admin/summary');
    } catch {
      dialogContext.setSnackbar({ open: true, snackbarMessage: 'Failed to add members.' });
    }
  };

  if (!codes?.survey_roles) {
    return null;
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
            validationSchema={manageUsersYupSchema}
            enableReinitialize={true}
            onSubmit={handleSubmit}>
            {({ values, setFieldValue, errors }) => {
              console.log(values, errors);
              return (
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
                        <Box>
                          <SystemUserAutocompleteField
                            formikFieldName="system_user_id"
                            label="Member"
                            placeholder="Search by user"
                            helpText={`Only active users who have requested access to the Species Inventory Management System before can be invited`}
                            selectedUsers={values.selectedMembers.map((member) => member.system_user_id)}
                            clearOnSelect
                            onSelect={(member) => {
                              if (member) {
                                const newUserObject: IPostSurveyMember = {
                                  system_user_id: member.system_user_id,
                                  survey_role_name: SURVEY_ROLE.ADMIN
                                };
                                setFieldValue('selectedMembers', [...values.selectedMembers, newUserObject]);
                              }
                            }}
                            key="project-user-filter"
                          />
                        </Box>
                        {/* <Box>
                          <Box
                            sx={{
                              '& .userRoleItemContainer + .userRoleItemContainer': {
                                mt: 1
                              }
                            }}>
                            <TransitionGroup>
                              {values.selectedMembers.map((user, index: number) => {
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
                                          <Typography style={{ fontSize: '12px', color: '#f44336' }}>
                                            {error}
                                          </Typography>
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
                        </Box> */}
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
              );
            }}
          </Formik>
        </Paper>
      </Container>
    </>
  );
};

export default ManageUsersForm;
