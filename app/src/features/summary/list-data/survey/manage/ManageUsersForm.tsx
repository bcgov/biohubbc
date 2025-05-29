import { LoadingButton } from '@mui/lab';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import PageHeader from 'components/layout/PageHeader';
import { SURVEY_ROLE } from 'constants/roles';
import { CodesContext } from 'contexts/codesContext';
import ParticipantsCollectionForm from 'features/collection/edit/participants/ParticipantsCollectionForm';
import { Formik, FormikProps } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useMemo } from 'react';

/**
 * Form for inviting multiple users to multiple surveys.
 *
 * @return {*}
 */
const ManageUsersForm = ({
  handleSubmit,
  formikRef,
  isSaving = false,
  handleCancel = () => {}
}: {
  handleSubmit: (formikData: any) => void;
  formikRef: React.RefObject<FormikProps<any>>;
  isSaving?: boolean;
  handleCancel?: () => void;
}) => {
  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data;
  const biohubApi = useBiohubApi();

  // Load all surveys
  const surveysDataLoader = useDataLoader(() =>
    biohubApi.survey.findSurveys(undefined, { survey_roles: [SURVEY_ROLE.ADMIN] })
  );

  const surveys = surveysDataLoader.data?.surveys || [];

  // Prepare survey options for Autocomplete
  const surveyOptions = useMemo(
    () =>
      surveys.map((survey) => ({
        value: survey.survey_id as number,
        label: survey.name as string
      })),
    [surveys]
  );

  // Initial values: selectedSurveys and participants
  const initialValues = {
    selectedSurveys: [] as number[], // survey_id[]
    participants: [] // as handled by ParticipantsCollectionForm
  };

  return (
    <>
      <PageHeader
        title="Manage Users"
        buttonJSX={
          <>
            <LoadingButton
              loading={isSaving}
              type="submit"
              color="primary"
              variant="contained"
              onClick={() => formikRef.current?.submitForm()}
              data-testid="submit-manage-users-button">
              Save and Exit
            </LoadingButton>
            <Button disabled={isSaving} color="primary" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        }
      />
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
                  summary="Invite members to access your surveys. Any individual role you assign here will apply to each member in every survey you have selected."
                  component={<ParticipantsCollectionForm roles={codes?.survey_roles ?? []} />}
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
                  <Button disabled={isSaving} color="primary" variant="outlined" onClick={handleCancel}>
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
