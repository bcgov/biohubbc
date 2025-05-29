import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { CodesContext } from 'contexts/codesContext';
import { Formik, FormikProps } from 'formik';
import { ISurveyMember} from 'interfaces/useSurveyApi.interface';
import { useContext, useMemo } from 'react';
import ParticipantsCollectionForm from 'features/collection/edit/participants/ParticipantsCollectionForm';
import { useAllSurveys } from 'hooks/useAllSurveys';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';

/**
 * Form for inviting multiple users to multiple surveys.
 *
 * @return {*}
 */
const ManageUsersForm = ({ handleSubmit, formikRef }: { handleSubmit: (formikData: any) => void; formikRef: React.RefObject<FormikProps<any>>; }) => {
  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data;

  // Load all surveys
  const { surveysDataLoader } = useAllSurveys();
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
    <Formik
      innerRef={formikRef}
      initialValues={initialValues}
      validateOnBlur={false}
      validateOnChange={false}
      enableReinitialize={true}
      onSubmit={handleSubmit}
    >
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
                value={surveyOptions.filter((option) => (values.selectedSurveys as number[]).includes(option.value))}
                onChange={(_, newValue) =>
                  setFieldValue('selectedSurveys', newValue.map((option) => option.value))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Select Surveys" placeholder="Search and select surveys" required />
                )}
                disableCloseOnSelect
              />
            }
          />
          {/* Bottom half: User/role selection */}
          <HorizontalSplitFormComponent
            title="Invite Members"
            summary="Invite members to access your surveys. Any individual role you assign here will apply to each member in every survey you have selected."
            component={<ParticipantsCollectionForm roles={codes?.survey_roles ?? []} />}
          />
          <Divider />
        </Stack>
      )}
    </Formik>
  );
};

export default ManageUsersForm;
